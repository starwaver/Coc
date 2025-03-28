export const successColors = {
    criticalSuccess: {
        bg: 'bg-warning/10',
        shadow: 'shadow-warning/30',
        text: 'text-warning',
        stats: 'bg-warning/10',
        animation: 'animate-glow',
        progressBar: 'bg-warning',
    },
    extremeSuccess: {
        bg: 'bg-primary/10',
        shadow: 'shadow-primary/30',
        text: 'text-primary',
        stats: 'bg-primary/10',
        animation: '',
        progressBar: 'bg-primary',
    },
    hardSuccess: {
        bg: 'bg-info/10',
        shadow: 'shadow-info/30',
        text: 'text-info',
        stats: 'bg-info/10',
        animation: '',
        progressBar: 'bg-info',
    },
    regularSuccess: {
        bg: 'bg-success/10',
        shadow: 'shadow-success/30',
        text: 'text-success',
        stats: 'bg-success/10',
        animation: '',
        progressBar: 'bg-success',
    },
    regularFailure: {
        bg: 'bg-error/10',
        shadow: 'shadow-error/30',
        text: 'text-error',
        stats: 'bg-error/10',
        animation: '',
        progressBar: 'bg-error',
    },
    criticalFailure: {
        bg: 'bg-error/10',
        shadow: 'shadow-error/30',
        text: 'text-error',
        stats: 'bg-error/50',
        animation: 'animate-shake-hard',
        progressBar: 'bg-error/50',
    },
} as const;

export type SuccessLevel = keyof typeof successColors;

// Helper function to get color classes for a success level
export function getSuccessColors(level: SuccessLevel) {
    return successColors[level];
} 