// ============================================
// TIPOS PARA SUPER ADMIN Y CONTROL DE API
// ============================================

export interface ApiUsageStats {
    userId: string;
    userName: string;
    schoolName: string;
    totalRequests: number;
    requestsThisMonth: number;
    lastRequest: string;
    estimatedCost: number; // En USD
}

export interface SchoolStats {
    schoolId: string;
    schoolName: string;
    totalUsers: number;
    totalPlaneaciones: number;
    apiRequestsThisMonth: number;
    estimatedCost: number;
    isBlocked: boolean;
    blockedReason?: string;
    blockedAt?: string;
}

export interface UserManagement {
    userId: string;
    email: string;
    nombre: string;
    schoolName: string;
    rol: string;
    puesto: string;
    isBlocked: boolean;
    blockedReason?: string;
    blockedAt?: string;
    apiUsage: {
        totalRequests: number;
        requestsThisMonth: number;
        lastRequest: string;
    };
}

export interface ApiQuota {
    userId?: string;
    schoolId?: string;
    maxRequestsPerMonth: number;
    maxRequestsPerDay: number;
    currentMonthUsage: number;
    currentDayUsage: number;
    resetDate: string;
}

export interface BlockAction {
    targetId: string; // userId o schoolId
    targetType: 'user' | 'school';
    reason: string;
    blockedBy: string;
    blockedAt: string;
    expiresAt?: string; // Opcional, para bloqueos temporales
}

export interface SystemStats {
    totalSchools: number;
    totalUsers: number;
    totalPlaneaciones: number;
    totalApiRequests: number;
    totalApiCost: number;
    activeUsers: number;
    blockedUsers: number;
    blockedSchools: number;
}
