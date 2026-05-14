import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseListComponent } from './license-list.component';

describe('LicenseListComponent', () => {
  let component: LicenseListComponent;
  let fixture: ComponentFixture<LicenseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LicenseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
