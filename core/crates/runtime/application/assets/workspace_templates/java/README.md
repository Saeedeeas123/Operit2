# Operit Java Project

This is a Java project template built with standard Gradle.

## Project Structure

```
operit-java-project/
├── build.gradle.kts          # Gradle build configuration
├── settings.gradle.kts       # Gradle project configuration
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/operit/app/
│   │   │       ├── Main.java           # main program entry point
│   │   │       └── Calculator.java     # example class
│   │   └── resources/
│   │       └── application.properties  # configuration file
│   └── test/
│       └── java/
│           └── com/operit/app/
│               └── CalculatorTest.java # unit test
└── .gitignore                # Git ignore file
```

## Quick Start

### 1️⃣ Install dependencies (first time only)
Go to **Terminal → Environment Setup** and install the following tools:
- ✅ OpenJDK 17
- ✅ Gradle

### 2️⃣ Initialize the project
1. Click the **"🔧 Initialize Gradle Wrapper"** button
   - This generates `gradlew` and the `gradle/` directory
   - The first run downloads Gradle 8.5 automatically

### 3️⃣ Build and run
- **Build project**: click "🔨 Build project"
- **Run program**: click "▶️ Run program"
- **Run tests**: click "🧪 Run tests"
- **Package JAR**: click "📦 Package JAR"
- **Clean build**: click "🧹 Clean build"

### Manual commands
```bash
# Use the Gradle Wrapper (recommended)
./gradlew build
./gradlew run
./gradlew test

# Or use gradle directly
gradle build
gradle run
```

### Building an executable JAR
```bash
./gradlew jar
java -jar build/libs/operit-java-project-1.0.0.jar
```

## Features

✅ **Standard Gradle project structure**  
✅ **Java 17** support  
✅ **JUnit 5** unit testing framework  
✅ **Package management** - Maven Central + Aliyun mirror  
✅ **Fat JAR** - executable JAR containing all dependencies  

## Adding dependencies

Add dependencies in `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.google.guava:guava:32.1.2-jre")
    implementation("com.google.code.gson:gson:2.10.1")
}
```

## Custom configuration

- Edit `build.gradle.kts` to change the build configuration
- Add new Java classes under `src/main/java`
- Add unit tests under `src/test/java`
- Edit `.operit/config.json` to customize Operit commands

Happy Coding! ☕
