export interface PressStats {
    total: number;
    published: number;
    draft: number;
    archived: number;
    deleted: number;
    countByType: { [key: string]: number };
    countByDiscipline: { [key: string]: number };
}
