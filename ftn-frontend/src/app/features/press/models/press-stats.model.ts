export interface PressStats {
    total: number;
    published: number;
    draft: number;

    scheduled: number;
    archived: number;
    deleted: number;
    totalViews: number;
    totalDownloads: number;
    countByType: { [key: string]: number };
    countByDiscipline: { [key: string]: number };
}
