from pathlib import Path
from collections import defaultdict
import cv2
from ultralytics import YOLO

BASE = Path(__file__).resolve().parent
INPUT = BASE / "videos" / "project_video.mp4"
OUTDIR = BASE / "videos" / "processed"
OUTPUT = OUTDIR / "traffic_analysis.mp4"

OUTDIR.mkdir(parents=True, exist_ok=True)

if not INPUT.exists():
    raise FileNotFoundError(f"Video not found: {INPUT}")

model = YOLO(str(BASE / "yolo11n.pt"))
cap = cv2.VideoCapture(str(INPUT))

if not cap.isOpened():
    raise RuntimeError(f"Cannot open video: {INPUT}")

fps = cap.get(cv2.CAP_PROP_FPS) or 25
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

writer = cv2.VideoWriter(
    str(OUTPUT), cv2.VideoWriter_fourcc(*"mp4v"),
    fps, (width, height)
)

if not writer.isOpened():
    cap.release()
    raise RuntimeError("Cannot create output video")

classes = {2: "Car", 3: "Motorcycle", 5: "Bus", 7: "Truck"}
tracked = defaultdict(set)
frame_counts = []
frame_no = 0

try:
    while True:
        ok, frame = cap.read()
        if not ok:
            break

        result = model.track(
            frame, persist=True, tracker="bytetrack.yaml",
            classes=list(classes.keys()), conf=0.25, verbose=False
        )[0]

        count = 0
        if result.boxes is not None:
            for i in range(len(result.boxes)):
                count += 1
                if result.boxes.id is not None:
                    cid = int(result.boxes.cls[i].item())
                    tid = int(result.boxes.id[i].item())
                    tracked[cid].add(tid)

        frame_counts.append(count)
        annotated = result.plot()
        cv2.putText(
            annotated, f"Vehicles in frame: {count}",
            (20, 40), cv2.FONT_HERSHEY_SIMPLEX,
            0.9, (0, 255, 0), 2
        )
        writer.write(annotated)
        frame_no += 1

        if frame_no % 100 == 0:
            print(f"Processed {frame_no} frames")

finally:
    cap.release()
    writer.release()

avg = sum(frame_counts) / len(frame_counts) if frame_counts else 0
level = "Low" if avg < 5 else "Medium" if avg < 15 else "High"

print("\n--- Traffic Analysis Results ---")
print(f"Frames processed: {frame_no}")
print(f"Average vehicles per frame: {avg:.2f}")
for cid, name in classes.items():
    print(f"{name}: {len(tracked[cid])} unique tracked IDs")
print(f"Estimated congestion: {level}")
print(f"Output video: {OUTPUT}")
