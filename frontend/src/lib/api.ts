const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Template {
    id: string;
    name: string;
    category: string;
    tags: string[];
    previewImageUrl: string;
    isPremium: boolean;
    language: string;
    country: string | null;
    downloadsCount: number;
}

export interface TemplateListResponse {
    templates: Template[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface Category {
    name: string;
    count: number;
}

class TemplateApi {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private getAuthHeader(): Record<string, string> {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async getTemplates(params?: {
        category?: string;
        isPremium?: boolean;
        language?: string;
        page?: number;
        limit?: number;
    }): Promise<TemplateListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.set('category', params.category);
        if (params?.isPremium !== undefined) queryParams.set('isPremium', String(params.isPremium));
        if (params?.language) queryParams.set('language', params.language);
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.limit) queryParams.set('limit', String(params.limit));

        const response = await fetch(`${this.baseUrl}/api/templates?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        return response.json();
    }

    async getRecommendedTemplates(): Promise<{ templates: Template[]; country: string }> {
        const response = await fetch(`${this.baseUrl}/api/templates/recommended`, {
            headers: this.getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return response.json();
    }

    async searchTemplates(query: string, category?: string): Promise<{ query: string; results: Template[] }> {
        const queryParams = new URLSearchParams({ q: query });
        if (category) queryParams.set('category', category);

        const response = await fetch(`${this.baseUrl}/api/templates/search?${queryParams}`);
        if (!response.ok) throw new Error('Failed to search templates');
        return response.json();
    }

    async getCategories(): Promise<{ categories: Category[] }> {
        const response = await fetch(`${this.baseUrl}/api/templates/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    }

    async getFavorites(): Promise<{ favorites: Template[] }> {
        const response = await fetch(`${this.baseUrl}/api/templates/favorites`, {
            headers: this.getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch favorites');
        return response.json();
    }

    async favoriteTemplate(templateId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/templates/favorite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
            },
            body: JSON.stringify({ templateId }),
        });
        if (!response.ok) throw new Error('Failed to favorite template');
    }

    async unfavoriteTemplate(templateId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/templates/favorite/${templateId}`, {
            method: 'DELETE',
            headers: this.getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to unfavorite template');
    }
}

export const templateApi = new TemplateApi();

// User and Auth API
export interface User {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    language: string;
    country: string | null;
    subscriptionTier: string;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private getAuthHeader(): Record<string, string> {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Auth methods
    async register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    }

    async getProfile(): Promise<User> {
        const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
            headers: this.getAuthHeader(),
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    }

    async logout(): Promise<void> {
        localStorage.removeItem('token');
    }
}

export const apiClient = new ApiClient();
