export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

export function formatZodError(error: { issues?: Array<{ message?: string }> }) {
    const firstIssue = error?.issues?.[0]
    return firstIssue?.message || 'Dados inválidos.'
}