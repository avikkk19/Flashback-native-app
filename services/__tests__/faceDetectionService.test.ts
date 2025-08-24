import FaceDetectionService from '../faceDetectionService';

describe('FaceDetectionService', () => {
  beforeEach(() => {
    // Reset the service before each test
    FaceDetectionService.reset();
  });

  test('should be a singleton instance', () => {
    const instance1 = FaceDetectionService.getInstance();
    const instance2 = FaceDetectionService.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('should initialize successfully', async () => {
    // Mock camera permissions
    const mockCamera = {
      requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' })
    };
    
    // Mock the Camera module
    jest.doMock('expo-camera', () => mockCamera);
    
    await expect(FaceDetectionService.initialize()).resolves.not.toThrow();
  });

  test('should analyze image for face detection', () => {
    const service = FaceDetectionService.getInstance();
    
    // Test with valid image data
    const result = (service as any).analyzeImageForFace('base64data', 400, 600);
    
    expect(result).toHaveProperty('hasFace');
    expect(result).toHaveProperty('faceCount');
    expect(result).toHaveProperty('isCentered');
    expect(result).toHaveProperty('isGoodSize');
    expect(result).toHaveProperty('leftEyeOpen');
    expect(result).toHaveProperty('rightEyeOpen');
    expect(result).toHaveProperty('confidence');
  });

  test('should detect motion between images', () => {
    const service = FaceDetectionService.getInstance();
    
    // Test motion detection
    const motion1 = (service as any).detectMotion('image1');
    const motion2 = (service as any).detectMotion('image2');
    
    expect(typeof motion1).toBe('boolean');
    expect(typeof motion2).toBe('boolean');
  });

  test('should detect blinks', () => {
    const service = FaceDetectionService.getInstance();
    
    // Test blink detection
    (service as any).detectBlink(true, true); // Motion detected, face present
    
    expect(service.getBlinkCount()).toBeGreaterThan(0);
  });

  test('should get instructions and tips', () => {
    const service = FaceDetectionService.getInstance();
    
    const instructions = service.getInstructions();
    const tips = service.getTips();
    
    expect(Array.isArray(instructions)).toBe(true);
    expect(Array.isArray(tips)).toBe(true);
    expect(instructions.length).toBeGreaterThan(0);
    expect(tips.length).toBeGreaterThan(0);
  });

  test('should reset state correctly', () => {
    const service = FaceDetectionService.getInstance();
    
    // Set some state
    (service as any).blinkCount = 5;
    (service as any).motionDetected = true;
    
    // Reset
    service.reset();
    
    expect(service.getBlinkCount()).toBe(0);
    expect((service as any).motionDetected).toBe(false);
  });
});
