import cv2
import sys
import json
import os


def process_video(video_path, output_path=None, display=False):
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise RuntimeError(f"Unable to open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 25

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    writer = None

    if output_path:
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(
            output_path,
            fourcc,
            fps,
            (width, height)
        )

    frame_count = 0
    total_regions = 0
    max_regions = 0

    # Sobel-like horizontal gradient kernel
    kernel = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ]

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        frame_count += 1

        # BGR -> Grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Sobel-like filtering
        gradient = cv2.filter2D(
            gray,
            cv2.CV_64F,
            __import__("numpy").array(kernel)
        )

        gradient = __import__("numpy").absolute(gradient)
        gradient = __import__("numpy").uint8(gradient)

        # Threshold
        _, threshold = cv2.threshold(
            gradient,
            50,
            255,
            cv2.THRESH_BINARY
        )

        # Remove upper region
        roi = threshold.copy()
        roi[: int(height * 0.45), :] = 0

        # Find contours
        contours, _ = cv2.findContours(
            roi,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        detected_regions = 0

        for contour in contours:
            area = cv2.contourArea(contour)

            # Area filtering
            if area < 100:
                continue

            detected_regions += 1

            # Minimum-area bounding rectangle
            rect = cv2.minAreaRect(contour)
            box = cv2.boxPoints(rect)
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
        max_regions = max(max_regions, detected_regions)

        # Information displayed on frame
        cv2.putText(
            frame,
            f"Lane Regions: {detected_regions}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            "OpenCV Lane Detection",
            (20, 75),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        if writer:
            writer.write(frame)

        if display:
            cv2.imshow("Smart Traffic - Lane Detection", frame)

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break

    cap.release()

    if writer:
        writer.release()

    if display:
        cv2.destroyAllWindows()

    average_regions = (
        total_regions / frame_count
        if frame_count > 0
        else 0
    )

    result = {
        "success": True,
        "framesProcessed": frame_count,
        "averageDetectedRegions": round(average_regions, 2),
        "maxDetectedRegions": max_regions,
        "outputVideo": output_path
    }

    return result


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

        print(json.dumps(result))

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