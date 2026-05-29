import { of } from 'rxjs';
import { UserImportFacadeService } from './user-import-facade.service';
import { ParsedCsvFile } from '../models/user-import.types';

describe('UserImportFacadeService.determineClub', () => {
  const parsed = (headers: string[], rows: string[][]): ParsedCsvFile => ({
    fileName: 'members.csv',
    fileSize: 100,
    headers,
    rows,
    forbiddenHeaders: []
  });

  const createService = (clubs: Array<{ id: number; name: string }> = []) => {
    const clubService = {
      findByName: (name: string) => of(clubs.find((club) => club.name.toLowerCase() === name.toLowerCase()) ?? null),
      getAll: () => of(clubs),
      createByName: (name: string) => of({ id: 99, name })
    };

    return new UserImportFacadeService(
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
      clubService as any
    );
  };

  it('resolves an existing club by name', async () => {
    const service = createService([{ id: 7, name: 'Club Tunis Natation' }]);

    const result = await service.determineClub(parsed(['nom_club', 'email'], [['Club Tunis Natation', 'a@b.com']]));

    expect(result.clubId).toBe(7);
    expect(result.needsCreation).toBeFalse();
    expect(result.error).toBe('');
  });

  it('requires creation when the club name does not exist', async () => {
    const service = createService();

    const result = await service.determineClub(parsed(['club_name', 'email'], [['Club Sfax', 'a@b.com']]));

    expect(result.clubName).toBe('Club Sfax');
    expect(result.needsCreation).toBeTrue();
    expect(result.createIfMissing).toBeFalse();
    expect(result.error).toBe('');
  });

  it('blocks import when the club column is missing', async () => {
    const service = createService();

    const result = await service.determineClub(parsed(['email'], [['a@b.com']]));

    expect(result.error).toContain('Nom du club manquant');
  });

  it('blocks import when the CSV contains multiple clubs', async () => {
    const service = createService();

    const result = await service.determineClub(parsed(['club', 'email'], [['Club A', 'a@b.com'], ['Club B', 'b@b.com']]));

    expect(result.error).toContain('plusieurs clubs');
  });
});
