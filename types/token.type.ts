export type TokenDataType = {
    user?: {
        data?: {
            is_terms_accepted?: boolean;
            [key: string]: any;
        };
    };
    exp?: number;
}