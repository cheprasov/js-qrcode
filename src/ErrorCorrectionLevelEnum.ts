export enum ErrorCorrectionLevelEnum {
    LOW = 'L', // Allows recovery of up to 7% data loss
    MEDIUM = 'M', // Allows recovery of up to 15% data loss
    QUARTILE = 'Q', // Allows recovery of up to 25% data loss
    HIGH = 'H', // Allows recovery of up to 30% data loss
}