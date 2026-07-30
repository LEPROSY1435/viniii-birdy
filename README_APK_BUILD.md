# Flappy Bird - Android APK Build Guide

This guide explains how to build an APK from the Flappy Bird web game.

## Prerequisites

1. **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
2. **JDK 11 or higher** - Required by Android Studio
3. **Android SDK** - Installed via Android Studio (API 34 for this project)
4. **Gradle** - Bundled with Android Studio

## Project Structure

```
viniii-birdy/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/vinnybird/game/
│   │       │   └── MainActivity.java        # Main app activity
│   │       ├── res/
│   │       │   ├── layout/
│   │       │   │   └── activity_main.xml    # UI layout
│   │       │   ├── values/
│   │       │   │   ├── strings.xml
│   │       │   │   ├── colors.xml
│   │       │   │   └── themes.xml
│   │       │   └── xml/
│   │       │       ├── backup_rules.xml
│   │       │       └── data_extraction_rules.xml
│   │       ├── assets/
│   │       │   ├── flappy.html              # Main game file
│   │       │   ├── flappy.js                # Game logic
│   │       │   ├── flappy.css               # Game styles
│   │       │   ├── bird.png                 # Game assets
│   │       │   ├── background.jpeg
│   │       │   ├── pillar.png
│   │       │   ├── background sound untill fail.mp3
│   │       │   └── fail sound.mp3
│   │       └── AndroidManifest.xml
│   ├── build.gradle                         # App-level build config
│   └── proguard-rules.pro
├── build.gradle                             # Project-level build config
├── settings.gradle                          # Gradle settings
└── gradle/wrapper/                          # Gradle wrapper

```

## Building the APK

### Method 1: Using Android Studio (Recommended)

1. **Open the Project**
   - Launch Android Studio
   - Click "File" → "Open..."
   - Navigate to the project directory and select it
   - Wait for Gradle sync to complete

2. **Build the APK**
   - Go to "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
   - Android Studio will compile and build the APK
   - The APK will be saved to: `app/build/outputs/apk/debug/app-debug.apk`

3. **Install on Device or Emulator**
   - Connect your Android device or start an emulator
   - Go to "Run" → "Run 'app'"
   - Select your device/emulator and click OK
   - The app will install and launch automatically

### Method 2: Using Gradle Command Line

```bash
# Navigate to project directory
cd viniii-birdy

# Build debug APK
./gradlew assembleDebug

# Build release APK (requires signing)
./gradlew assembleRelease
```

The APK files will be in:
- Debug: `app/build/outputs/apk/debug/app-debug.apk`
- Release: `app/build/outputs/apk/release/app-release.apk`

### Method 3: Using Google Play Console (For Distribution)

1. Create a signed APK:
   ```bash
   ./gradlew bundleRelease
   ```

2. Sign your APK in Android Studio:
   - "Build" → "Generate Signed Bundle / APK..."
   - Follow the wizard to create or select a keystore
   - Choose "APK" and "Release"

3. Upload to Google Play Console at [play.google.com/console](https://play.google.com/console)

## Testing the APK

### On Physical Device
```bash
# Install debug APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Or if device is connected via Android Studio, simply click Run
```

### On Android Emulator
- Create/start an emulator via Android Studio's AVD Manager
- Run the app through Android Studio
- Or use adb: `adb install-multiple app/build/outputs/apk/debug/app-debug.apk`

## Troubleshooting

### Build Fails
- **"SDK location not found"**: Set `ANDROID_HOME` or create `local.properties` with `sdk.dir=/path/to/android-sdk`
- **"Gradle sync failed"**: Try File → Sync Now or invalidate cache (File → Invalidate Caches)
- **"Java version not compatible"**: Ensure JDK 11+ is installed and set as default

### App Crashes on Launch
- Check logcat in Android Studio (View → Tool Windows → Logcat)
- Ensure assets are in `app/src/main/assets/`
- Verify WebView settings in `MainActivity.java`

### APK Size
- Current size is ~5-8 MB
- To reduce: Enable ProGuard by setting `minifyEnabled true` in `build.gradle`

## Customization

### Change App Name
Edit `app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

### Change Version
Edit `app/build.gradle`:
```gradle
versionCode 1      # Increment for each release
versionName "1.0"  # Version string for users
```

### Add Permissions
Edit `app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.YOUR_PERMISSION" />
```

## Next Steps

1. Test thoroughly on various devices and Android versions
2. Create a release-signed APK for distribution
3. Upload to Google Play Store or distribute via other app stores
4. Gather user feedback and iterate

## Resources

- [Android Developer Guide](https://developer.android.com/docs)
- [Gradle Plugin Documentation](https://developer.android.com/studio/build)
- [WebView Documentation](https://developer.android.com/reference/android/webkit/WebView)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

## License

This game is based on the Flappy Bird concept. Ensure you have proper rights to distribute.
