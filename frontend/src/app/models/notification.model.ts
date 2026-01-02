export interface Notification {
    id?: number;
    userId: number;
    titre: string;
    message: string;
    type: NotificationType;
    lu: boolean;
    createdAt?: Date;
}

export type NotificationType =
    | 'INFO'
    | 'SUCCESS'
    | 'WARNING'
    | 'ERROR'
    | 'INSCRIPTION'
    | 'SOUTENANCE'
    | 'DOCUMENT';
