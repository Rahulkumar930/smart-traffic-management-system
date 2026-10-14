import cv2
import sys
import json
import os
import numpy as np
from ultralytics import YOLO


# ============================================================
# CONFIGURATION
# ============================================================

# YOLO model
MODEL_NAME = "yolo11n.pt"

# COCO vehicle classes
# 2 = car
# 3 = motorcycle
# 5 = bus
# 7 = truck
VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}

# YOLO confidence threshold
CONFIDENCE_THRESHOLD = 0.35

# Process every Nth frame for YOLO.
# 1 = every frame
# 2 = every second frame
# This improves CPU performance.
YOLO_FRAME_INTERVAL = 2


# ============================================================
# CONGESTION CALCULATION
# ============================================================

def calculate_congestion(vehicle_count):
    """
    Estimate congestion based on the number of detected
    vehicles in the current frame.

    These thresholds are intended for a project/demo and
    should be calibrated for the actual camera/road.
    """

    if vehicle_count <= 5:
        return "Low"

    elif vehicle_count <= 12:
        return "Medium"

    elif vehicle_count <= 20:
        return "High"

    else:
        return "Severe"


# ============================================================
# LANE DETECTION + VEHICLE DETECTION
# ============================================================

def process_video(video_path, output_path=None, display=False):

    # --------------------------------------------------------
    # Check input video
    # --------------------------------------------------------

    if not os.path.exists(video_path):
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise RuntimeError(
            f"Unable to open video: {video_path}"
        )

    # --------------------------------------------------------
    # Video information
    # --------------------------------------------------------

    fps = cap.get(cv2.CAP_PROP_FPS)

    if fps <= 0:
        fps = 25

    width = int(
        cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    )

    height = int(
        cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    )

    total_video_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    # --------------------------------------------------------
    # Output video writer
    # --------------------------------------------------------

    writer = None

    if output_path:

        output_directory = os.path.dirname(
            os.path.abspath(output_path)
        )

        os.makedirs(
            output_directory,
            exist_ok=True
        )

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
            cap.release()

            raise RuntimeError(
                f"Unable to create output video: {output_path}"
            )

    # --------------------------------------------------------
    # Load YOLO model
    # --------------------------------------------------------

    print(
        json.dumps({
            "status": "Loading YOLO model"
        }),
        flush=True
    )

    model = YOLO(MODEL_NAME)

    print(
        json.dumps({
            "status": "YOLO model loaded"
        }),
        flush=True
    )

    # --------------------------------------------------------
    # Statistics
    # --------------------------------------------------------

    frame_count = 0

    total_regions = 0
    max_regions = 0

    total_vehicle_detections = 0
    max_vehicle_count = 0

    vehicle_counts_by_type = {
        "car": 0,
        "motorcycle": 0,
        "bus": 0,
        "truck": 0
    }

    # Keep the last YOLO detections so frames between
    # YOLO runs can still display the latest detections.
    last_vehicle_detections = []

    # --------------------------------------------------------
    # Sobel-like horizontal gradient kernel
    # --------------------------------------------------------

    kernel = np.array([
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ])

    # ========================================================
    # FRAME PROCESSING
    # ========================================================

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1

        # ====================================================
        # 1. OPENCV LANE / EDGE DETECTION
        # ====================================================

        # BGR -> Grayscale
        gray = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2GRAY
        )

        # Sobel-like filtering
        gradient = cv2.filter2D(
            gray,
            cv2.CV_64F,
            kernel
        )

        gradient = np.absolute(
            gradient
        )

        gradient = np.uint8(
            gradient
        )

        # Threshold
        _, threshold = cv2.threshold(
            gradient,
            50,
            255,
            cv2.THRESH_BINARY
        )

        # Remove upper region
        roi = threshold.copy()

        roi[
            :int(height * 0.45),
            :
        ] = 0

        # Find contours
        contours, _ = cv2.findContours(
            roi,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        detected_regions = 0

        for contour in contours:

            area = cv2.contourArea(
                contour
            )

            # Area filtering
            if area < 100:
                continue

            detected_regions += 1

            # Minimum-area bounding rectangle
            rect = cv2.minAreaRect(
                contour
            )

            box = cv2.boxPoints(
                rect
            )

            box = box.astype(int)

            # Draw contour
            cv2.drawContours(
                frame,
                [contour],
                -1,
                (0, 255, 0),
                2
            )

            # Draw bounding rectangle
            cv2.drawContours(
                frame,
                [box],
                0,
                (0, 0, 255),
                2
            )

        total_regions += detected_regions

        max_regions = max(
            max_regions,
            detected_regions
        )

        # ====================================================
        # 2. YOLO VEHICLE DETECTION
        # ====================================================

        if (
            frame_count == 1
            or frame_count % YOLO_FRAME_INTERVAL == 0
        ):

            try:

                results = model.predict(
                    frame,
                    conf=CONFIDENCE_THRESHOLD,
                    classes=list(
                        VEHICLE_CLASSES.keys()
                    ),
                    verbose=False
                )

                current_detections = []

                current_vehicle_count = 0

                current_type_counts = {
                    "car": 0,
                    "motorcycle": 0,
                    "bus": 0,
                    "truck": 0
                }

                for result in results:

                    if result.boxes is None:
                        continue

                    for box in result.boxes:

                        confidence = float(
                            box.conf[0]
                        )

                        class_id = int(
                            box.cls[0]
                        )

                        if class_id not in VEHICLE_CLASSES:
                            continue

                        vehicle_type = VEHICLE_CLASSES[
                            class_id
                        ]

                        x1, y1, x2, y2 = map(
                            int,
                            box.xyxy[0].tolist()
                        )

                        current_detections.append(
                            (
                                x1,
                                y1,
                                x2,
                                y2,
                                vehicle_type,
                                confidence
                            )
                        )

                        current_vehicle_count += 1

                        current_type_counts[
                            vehicle_type
                        ] += 1

                last_vehicle_detections = (
                    current_detections
                )

                total_vehicle_detections += (
                    current_vehicle_count
                )

                max_vehicle_count = max(
                    max_vehicle_count,
                    current_vehicle_count
                )

                for vehicle_type in current_type_counts:

                    vehicle_counts_by_type[
                        vehicle_type
                    ] += current_type_counts[
                        vehicle_type
                    ]

            except Exception as error:

                print(
                    json.dumps({
                        "status": "YOLO frame error",
                        "error": str(error)
                    }),
                    flush=True
                )

        # ====================================================
        # 3. DRAW VEHICLE DETECTIONS
        # ====================================================

        displayed_vehicle_count = len(
            last_vehicle_detections
        )

        for detection in last_vehicle_detections:

            (
                x1,
                y1,
                x2,
                y2,
                vehicle_type,
                confidence
            ) = detection

            # Vehicle bounding box
            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (255, 0, 0),
                2
            )

            label = (
                f"{vehicle_type} "
                f"{confidence:.2f}"
            )

            # Label background
            text_size = cv2.getTextSize(
                label,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                2
            )[0]

            text_width = text_size[0]
            text_height = text_size[1]

            cv2.rectangle(
                frame,
                (x1, max(0, y1 - text_height - 10)),
                (
                    x1 + text_width + 8,
                    y1
                ),
                (255, 0, 0),
                -1
            )

            cv2.putText(
                frame,
                label,
                (x1 + 4, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (255, 255, 255),
                2
            )

        # ====================================================
        # 4. CONGESTION
        # ====================================================

        current_congestion = calculate_congestion(
            displayed_vehicle_count
        )

        # ====================================================
        # 5. INFORMATION ON VIDEO
        # ====================================================

        cv2.putText(
            frame,
            f"Lane Regions: {detected_regions}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Vehicles: {displayed_vehicle_count}",
            (20, 75),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Congestion: {current_congestion}",
            (20, 110),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            "OpenCV + YOLO Vehicle Detection",
            (20, 145),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        # ====================================================
        # 6. WRITE OUTPUT
        # ====================================================

        if writer:
            writer.write(frame)

        # ====================================================
        # 7. OPTIONAL DISPLAY
        # ====================================================

        if display:

            cv2.imshow(
                "Smart Traffic - Lane Detection",
                frame
            )

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break

    # ========================================================
    # CLEANUP
    # ========================================================

    cap.release()

    if writer:
        writer.release()

    if display:
        cv2.destroyAllWindows()

    # ========================================================
    # FINAL STATISTICS
    # ========================================================

    average_regions = (
        total_regions / frame_count
        if frame_count > 0
        else 0
    )

    # Number of YOLO processed frames
    yolo_processed_frames = max(
        1,
        (frame_count + YOLO_FRAME_INTERVAL - 1)
        // YOLO_FRAME_INTERVAL
    )

    # Average vehicle detections per YOLO-processed frame
    average_vehicle_count = (
        total_vehicle_detections
        / yolo_processed_frames
        if yolo_processed_frames > 0
        else 0
    )

    # Approximate overall vehicle count.
    # This is an average number of vehicles visible in a frame,
    # NOT the number of unique vehicles in the whole video.
    estimated_vehicle_count = round(
        average_vehicle_count
    )

    congestion_level = calculate_congestion(
        estimated_vehicle_count
    )

    # ========================================================
    # RESULT
    # ========================================================

    result = {
        "success": True,

        "framesProcessed": frame_count,

        "totalVideoFrames": total_video_frames,

        "averageDetectedRegions": round(
            average_regions,
            2
        ),

        "maxDetectedRegions": max_regions,

        "vehicleCount": estimated_vehicle_count,

        "maxVehiclesInFrame": max_vehicle_count,

        "averageVehiclesPerFrame": round(
            average_vehicle_count,
            2
        ),

        "vehicleTypes": {
            "cars": vehicle_counts_by_type["car"],
            "motorcycles": vehicle_counts_by_type["motorcycle"],
            "buses": vehicle_counts_by_type["bus"],
            "trucks": vehicle_counts_by_type["truck"]
        },

        "averageSpeed": 0,

        "speedStatus": (
            "Speed estimation requires "
            "camera calibration and vehicle tracking."
        ),

        "congestionLevel": congestion_level,

        "outputVideo": output_path
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
            output_path,
            display=False
        )

        print(
            json.dumps(result)
        )

    except Exception as error:

        print(
            json.dumps({
                "success": False,
                "error": str(error)
            })
        )

        sys.exit(1)


if __name__ == "__main__":
    main()