import cv2
import sys
import json
import os
import math
import numpy as np
from ultralytics import YOLO


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_NAME = "yolo11n.pt"

# Approximate pixel-to-meter calibration.
# This is configurable because every camera has different
# perspective and mounting characteristics.
METERS_PER_PIXEL = 0.05

# Ignore very small speed changes caused by detection noise.
MIN_SPEED_KMH = 0.5

# Maximum accepted speed for filtering tracking noise.
MAX_SPEED_KMH = 150.0

# Vehicle classes in COCO / YOLO:
# 2 = car
# 3 = motorcycle
# 5 = bus
# 7 = truck
VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}


# ============================================================
# SPEED ESTIMATION
# ============================================================

def calculate_speed(previous_point, current_point, fps):
    """
    Estimate speed from movement of the vehicle center point.

    Speed = distance / time

    Pixel distance is converted approximately to meters using
    METERS_PER_PIXEL.
    """

    if previous_point is None:
        return 0.0

    if fps <= 0:
        return 0.0

    dx = current_point[0] - previous_point[0]
    dy = current_point[1] - previous_point[1]

    pixel_distance = math.sqrt(dx * dx + dy * dy)

    # Convert pixels to meters
    distance_meters = pixel_distance * METERS_PER_PIXEL

    # Time represented by one frame
    time_seconds = 1.0 / fps

    speed_mps = distance_meters / time_seconds

    speed_kmh = speed_mps * 3.6

    # Remove tiny detection noise
    if speed_kmh < MIN_SPEED_KMH:
        speed_kmh = 0.0

    # Reject unrealistic tracking jumps
    if speed_kmh > MAX_SPEED_KMH:
        return 0.0

    return speed_kmh


# ============================================================
# OPENCV LANE DETECTION
# ============================================================

def detect_lane_regions(frame):
    """
    Existing OpenCV-based lane-region detection.
    """

    height, width = frame.shape[:2]

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    kernel = np.array([
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ], dtype=np.float32)

    gradient = cv2.filter2D(
        gray,
        cv2.CV_64F,
        kernel
    )

    gradient = np.absolute(gradient)
    gradient = np.uint8(np.clip(gradient, 0, 255))

    _, threshold = cv2.threshold(
        gradient,
        50,
        255,
        cv2.THRESH_BINARY
    )

    # Ignore sky / upper portion
    roi = threshold.copy()
    roi[:int(height * 0.45), :] = 0

    contours, _ = cv2.findContours(
        roi,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    detected_regions = 0

    for contour in contours:

        area = cv2.contourArea(contour)

        if area < 100:
            continue

        detected_regions += 1

        # Draw contour
        cv2.drawContours(
            frame,
            [contour],
            -1,
            (0, 255, 0),
            2
        )

        # Minimum-area bounding rectangle
        rect = cv2.minAreaRect(contour)

        box = cv2.boxPoints(rect)

        box = box.astype(int)

        cv2.drawContours(
            frame,
            [box],
            0,
            (0, 0, 255),
            2
        )

    return detected_regions


# ============================================================
# VEHICLE TRACKING + SPEED
# ============================================================

def process_video(video_path, output_path=None):

    if not os.path.exists(video_path):
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    print(
        json.dumps({
            "status": "Loading YOLO tracking model"
        }),
        flush=True
    )

    model = YOLO(MODEL_NAME)

    print(
        json.dumps({
            "status": "YOLO tracking model loaded"
        }),
        flush=True
    )

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise RuntimeError(
            f"Unable to open video: {video_path}"
        )

    fps = cap.get(cv2.CAP_PROP_FPS)

    if fps <= 0:
        fps = 25.0

    total_video_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    width = int(
        cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    )

    height = int(
        cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    )

    writer = None

    if output_path:

        output_dir = os.path.dirname(
            os.path.abspath(output_path)
        )

        os.makedirs(
            output_dir,
            exist_ok=True
        )

        # MP4/H264-friendly writer
        fourcc = cv2.VideoWriter_fourcc(
            *"mp4v"
        )

        writer = cv2.VideoWriter(
            output_path,
            fourcc,
            fps,
            (width, height)
        )

        if not writer.isOpened():
            raise RuntimeError(
                f"Unable to create output video: {output_path}"
            )

    # ========================================================
    # Statistics
    # ========================================================

    frame_count = 0

    total_lane_regions = 0

    max_lane_regions = 0

    total_vehicle_detections = 0

    max_vehicles_in_frame = 0

    total_vehicle_instances_per_frame = 0

    vehicle_type_counts = {
        "cars": 0,
        "motorcycles": 0,
        "buses": 0,
        "trucks": 0,
    }

    # Track positions:
    # track_id -> (x, y)
    previous_positions = {}

    # Track speed history:
    # track_id -> latest speed
    current_speeds = {}

    all_speeds = []

    max_speed = 0.0

    # IDs seen during complete video
    tracked_ids = set()

    # Unique vehicle IDs by class
    vehicle_ids_by_type = {
        "cars": set(),
        "motorcycles": set(),
        "buses": set(),
        "trucks": set(),
    }

    # ========================================================
    # PROCESS VIDEO
    # ========================================================

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1

        # ----------------------------------------------------
        # OpenCV lane detection
        # ----------------------------------------------------

        detected_regions = detect_lane_regions(frame)

        total_lane_regions += detected_regions

        max_lane_regions = max(
            max_lane_regions,
            detected_regions
        )

        # ----------------------------------------------------
        # YOLO tracking
        # ----------------------------------------------------

        results = model.track(
            frame,
            persist=True,
            classes=list(VEHICLE_CLASSES.keys()),
            verbose=False,
            tracker="bytetrack.yaml"
        )

        frame_vehicle_count = 0

        frame_speeds = []

        if results:

            result = results[0]

            boxes = result.boxes

            if boxes is not None and len(boxes) > 0:

                xyxy = boxes.xyxy.cpu().numpy()

                classes = boxes.cls.cpu().numpy()

                ids = None

                if boxes.id is not None:
                    ids = boxes.id.cpu().numpy().astype(int)

                for index, box in enumerate(xyxy):

                    class_id = int(classes[index])

                    if class_id not in VEHICLE_CLASSES:
                        continue

                    vehicle_type = VEHICLE_CLASSES[class_id]

                    frame_vehicle_count += 1

                    total_vehicle_detections += 1

                    # ------------------------------------------------
                    # Vehicle ID
                    # ------------------------------------------------

                    track_id = None

                    if ids is not None:
                        track_id = int(ids[index])

                        tracked_ids.add(track_id)

                    # ------------------------------------------------
                    # Vehicle type statistics
                    # ------------------------------------------------

                    if vehicle_type == "car":
                        vehicle_type_counts["cars"] += 1

                    elif vehicle_type == "motorcycle":
                        vehicle_type_counts["motorcycles"] += 1

                    elif vehicle_type == "bus":
                        vehicle_type_counts["buses"] += 1

                    elif vehicle_type == "truck":
                        vehicle_type_counts["trucks"] += 1

                    # Count unique tracked vehicles by type
                    if track_id is not None:

                        if vehicle_type == "car":
                            vehicle_ids_by_type["cars"].add(track_id)

                        elif vehicle_type == "motorcycle":
                            vehicle_ids_by_type["motorcycles"].add(track_id)

                        elif vehicle_type == "bus":
                            vehicle_ids_by_type["buses"].add(track_id)

                        elif vehicle_type == "truck":
                            vehicle_ids_by_type["trucks"].add(track_id)

                    # ------------------------------------------------
                    # Bounding box
                    # ------------------------------------------------

                    x1, y1, x2, y2 = map(
                        int,
                        box
                    )

                    # Bottom-center is better for road movement
                    # than the center of the bounding box.
                    center_x = int(
                        (x1 + x2) / 2
                    )

                    center_y = int(y2)

                    current_point = (
                        center_x,
                        center_y
                    )

                    speed = 0.0

                    # ------------------------------------------------
                    # Speed calculation
                    # ------------------------------------------------

                    if track_id is not None:

                        previous_point = (
                            previous_positions.get(
                                track_id
                            )
                        )

                        speed = calculate_speed(
                            previous_point,
                            current_point,
                            fps
                        )

                        previous_positions[
                            track_id
                        ] = current_point

                        current_speeds[
                            track_id
                        ] = speed

                    if speed > 0:

                        frame_speeds.append(speed)

                        all_speeds.append(speed)

                        max_speed = max(
                            max_speed,
                            speed
                        )

                    # ------------------------------------------------
                    # Draw vehicle box
                    # ------------------------------------------------

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (255, 0, 0),
                        2
                    )

                    # ------------------------------------------------
                    # Vehicle label
                    # ------------------------------------------------

                    if track_id is not None:

                        label = (
                            f"{vehicle_type.title()} "
                            f"ID:{track_id}"
                        )

                    else:

                        label = (
                            f"{vehicle_type.title()}"
                        )

                    if speed > 0:

                        label += (
                            f" | {speed:.1f} km/h"
                        )

                    # Background for label
                    text_size = cv2.getTextSize(
                        label,
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.55,
                        2
                    )[0]

                    label_y = max(
                        y1 - 8,
                        text_size[1] + 5
                    )

                    cv2.rectangle(
                        frame,
                        (
                            x1,
                            label_y - text_size[1] - 6
                        ),
                        (
                            x1 + text_size[0] + 6,
                            label_y + 3
                        ),
                        (255, 0, 0),
                        -1
                    )

                    cv2.putText(
                        frame,
                        label,
                        (
                            x1 + 3,
                            label_y
                        ),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.55,
                        (255, 255, 255),
                        2
                    )

                    # ------------------------------------------------
                    # Draw movement point
                    # ------------------------------------------------

                    cv2.circle(
                        frame,
                        current_point,
                        4,
                        (0, 255, 255),
                        -1
                    )

        # ========================================================
        # FRAME STATISTICS
        # ========================================================

        total_vehicle_instances_per_frame += (
            frame_vehicle_count
        )

        max_vehicles_in_frame = max(
            max_vehicles_in_frame,
            frame_vehicle_count
        )

        # ========================================================
        # CONGESTION
        # ========================================================

        if frame_vehicle_count >= 12:

            congestion_level = "Severe"

        elif frame_vehicle_count >= 8:

            congestion_level = "High"

        elif frame_vehicle_count >= 4:

            congestion_level = "Medium"

        else:

            congestion_level = "Low"

        # ========================================================
        # SPEED FOR CURRENT FRAME
        # ========================================================

        if frame_speeds:

            frame_average_speed = (
                sum(frame_speeds)
                / len(frame_speeds)
            )

        else:

            frame_average_speed = 0.0

        # ========================================================
        # INFORMATION PANEL
        # ========================================================

        panel_height = 225

        overlay = frame.copy()

        cv2.rectangle(
            overlay,
            (15, 15),
            (590, panel_height),
            (25, 35, 45),
            -1
        )

        cv2.addWeighted(
            overlay,
            0.78,
            frame,
            0.22,
            0,
            frame
        )

        cv2.putText(
            frame,
            f"Lane Regions: {detected_regions}",
            (30, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Vehicles: {frame_vehicle_count}",
            (30, 78),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Tracked IDs: {len(tracked_ids)}",
            (30, 111),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Frame Speed: {frame_average_speed:.1f} km/h",
            (30, 144),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.70,
            (0, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Max Speed: {max_speed:.1f} km/h",
            (30, 177),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.70,
            (0, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Congestion: {congestion_level}",
            (30, 210),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.70,
            (0, 255, 0),
            2
        )

        # ========================================================
        # WRITE FRAME
        # ========================================================

        if writer:

            writer.write(frame)

    # ============================================================
    # RELEASE RESOURCES
    # ============================================================

    cap.release()

    if writer:
        writer.release()

    # ============================================================
    # FINAL STATISTICS
    # ============================================================

    if frame_count > 0:

        average_lane_regions = (
            total_lane_regions
            / frame_count
        )

        average_vehicles_per_frame = (
            total_vehicle_instances_per_frame
            / frame_count
        )

    else:

        average_lane_regions = 0.0

        average_vehicles_per_frame = 0.0

    if all_speeds:

        average_speed = (
            sum(all_speeds)
            / len(all_speeds)
        )

    else:

        average_speed = 0.0

    # Final congestion based on average vehicles/frame
    if average_vehicles_per_frame >= 12:

        final_congestion = "Severe"

    elif average_vehicles_per_frame >= 8:

        final_congestion = "High"

    elif average_vehicles_per_frame >= 4:

        final_congestion = "Medium"

    else:

        final_congestion = "Low"

    # ============================================================
    # RESULT
    # ============================================================

    result = {
        "success": True,

        "framesProcessed": frame_count,

        "totalVideoFrames": total_video_frames,

        "averageDetectedRegions": round(
            average_lane_regions,
            2
        ),

        "maxDetectedRegions": max_lane_regions,

        "vehicleCount": total_vehicle_detections,

        "maxVehiclesInFrame": max_vehicles_in_frame,

        "averageVehiclesPerFrame": round(
            average_vehicles_per_frame,
            2
        ),

        "vehicleTypes": vehicle_type_counts,

        "trackedVehicleIds": len(tracked_ids),

        "uniqueVehicles": {
            "cars": len(
                vehicle_ids_by_type["cars"]
            ),
            "motorcycles": len(
                vehicle_ids_by_type["motorcycles"]
            ),
            "buses": len(
                vehicle_ids_by_type["buses"]
            ),
            "trucks": len(
                vehicle_ids_by_type["trucks"]
            ),
        },

        "averageSpeed": round(
            average_speed,
            2
        ),

        "maximumSpeed": round(
            max_speed,
            2
        ),

        "speedStatus": (
            "Estimated using YOLO tracking, "
            "frame rate and configurable "
            "pixel-to-meter calibration."
        ),

        "calibration": {
            "metersPerPixel": METERS_PER_PIXEL,
            "fps": round(fps, 2),
            "note": (
                "Speed is an approximate estimate. "
                "For real-world accuracy, calibrate "
                "the camera using known road distances "
                "or a homography."
            )
        },

        "congestionLevel": final_congestion,

        "outputVideo": output_path,
    }

    return result


# ============================================================
# MAIN
# ============================================================

def main():

    if len(sys.argv) < 2:

        print(
            json.dumps({
                "success": False,
                "error": "Video path is required"
            })
        )

        sys.exit(1)

    video_path = sys.argv[1]

    output_path = None

    if len(sys.argv) >= 3:

        output_path = sys.argv[2]

    try:

        result = process_video(
            video_path,
            output_path
        )

        print(
            json.dumps(
                result,
                indent=2
            ),
            flush=True
        )

    except Exception as error:

        print(
            json.dumps({
                "success": False,
                "error": str(error)
            }),
            flush=True
        )

        sys.exit(1)


if __name__ == "__main__":

    main()