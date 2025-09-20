import tensorflow as tf
import os
from tensorflow import keras
from tensorflow.keras import layers, models # type: ignore
from tensorflow.keras.models import Sequential # type: ignore
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout # type: ignore
from tensorflow.keras.preprocessing.image import ImageDataGenerator # type: ignore

# -------------------------------
# 1. Load & preprocess dataset
# -------------------------------
img_size = (64,64)
batch_size = 32
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

path = os.getcwd()  # current working directory (project folder)

train_generator = datagen.flow_from_directory(
    os.path.join(path, "asl_alphabet_train", "asl_alphabet_train"),
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='training'
)
print("Files in dataset path:", os.listdir(os.path.join(path, "asl_alphabet_train")))


val_generator = datagen.flow_from_directory(
    os.path.join(path, "asl_alphabet_train", "asl_alphabet_train"),
    target_size=img_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation'
)
print("Classes found:", train_generator.class_indices)
print("Number of training samples:", train_generator.samples)
print("Number of validation samples:", val_generator.samples)


model = Sequential([
    layers.Input(shape=(64, 64, 3)),
    layers.Conv2D(32, (3,3), activation='relu', input_shape=(64,64,3)),
    layers.MaxPooling2D((2,2)),

    layers.Conv2D(64, (3,3), activation='relu'),
    layers.MaxPooling2D((2,2)),

    layers.Conv2D(128, (3,3), activation='relu'),
    layers.MaxPooling2D((2,2)),

    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.4),
    layers.Dense(train_generator.num_classes, activation='softmax')
])

model.compile(optimizer='adam',loss='categorical_crossentropy',metrics=['accuracy'])




# -------------------------------
# 3. Train model
# -------------------------------
history = model.fit(
    train_generator,
    epochs=8,
    validation_data=val_generator
)

# -------------------------------
# 4. Save model
# -------------------------------
model.save("asl_modelv3.h5")
print(model.summary())



