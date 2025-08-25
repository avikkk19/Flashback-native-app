#!/bin/bash

# Set environment variables for Android build
export ANDROID_HOME=/home/avinashkamadri/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH

# Verify Java installation
echo "Java version:"
java -version
echo "Javac version:"
javac -version
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"

# Run the Gradle build
echo "Starting Android build..."
./gradlew clean
