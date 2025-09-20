import cv2
import numpy as np
import tensorflow as tf
from collections import deque, Counter

# -----------------------------
# 1️⃣ Load your trained ASL model
# -----------------------------
model = tf.keras.models.load_model("asl_model.h5")
labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 
          'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 
          'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'del', 'nothing', 'space']

# -----------------------------
# 2️⃣ Open webcam
# -----------------------------
cap = cv2.VideoCapture(1)  # force DirectShow on Windows
if not cap.isOpened():
    print("Cannot open webcam")
    exit()

# -----------------------------
# 3️⃣ Fixed ROI for hand detection
# -----------------------------
roi_top, roi_bottom, roi_left, roi_right = 50, 450, 200, 650

# -----------------------------
# 4️⃣ Rolling buffer for prediction smoothing
# -----------------------------
pred_buffer = deque(maxlen=40)  # last 10 frames

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)  # mirror
        # Get frame dimensions
        frame_h = frame.shape[0]
        frame_w = frame.shape[1]

        # Define ROI size
        roi_h = 350  # height of ROI
        roi_w = 350  # width of ROI

        # Calculate top-left corner so ROI is centered
        roi_top = (frame_h - roi_h) // 2
        roi_bottom = roi_top + roi_h
        roi_left = (frame_w - roi_w) // 2
        roi_right = roi_left + roi_w

        roi = frame[roi_top:roi_bottom, roi_left:roi_right]

        # Draw fixed ROI box
        cv2.rectangle(frame, (roi_left, roi_top), (roi_right, roi_bottom), (255, 0, 0), 2)

        # -----------------------------
        # Hand detection via skin-color segmentation
        # -----------------------------
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        mask = cv2.inRange(hsv, lower_skin, upper_skin)
        mask = cv2.GaussianBlur(mask, (5,5), 0)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        predicted_letter = ""

        if contours:
            # Largest contour assumed as hand
            c = max(contours, key=cv2.contourArea)
            if cv2.contourArea(c) > 2000:  # ignore small noise
                x, y, w_box, h_box = cv2.boundingRect(c)
                # Draw bounding box relative to full frame
                #cv2.rectangle(frame, (roi_left + x, roi_top + y), 
                              #(roi_left + x + w_box, roi_top + y + h_box), 
                              #(0, 255, 0), 2)

                # Crop and preprocess hand for prediction
                hand_crop = roi[y:y+h_box, x:x+w_box]
                if hand_crop.size != 0:
                    try:
                        roi_resized = cv2.resize(hand_crop, (64, 64))
                        roi_norm = roi_resized.astype("float32") / 255.0
                        roi_input = np.expand_dims(roi_norm, axis=0)
                        pred = model.predict(roi_input, verbose=0)
                        class_id = np.argmax(pred)
                        predicted_letter = labels[class_id]
                        # Add to prediction buffer
                        pred_buffer.append(predicted_letter)
                    except:
                        pass

        # -----------------------------
        # Smooth predictions over last 10 frames
        # -----------------------------
        if pred_buffer:
            most_common = Counter(pred_buffer).most_common(1)[0][0]
            cv2.putText(frame, most_common, (roi_left, roi_top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 3)

        # Display webcam feed
        cv2.imshow("ASL Recognition", frame)

        # Quit on pressing 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

finally:
    # Release resources safely
    cap.release()
    cv2.destroyAllWindows()
