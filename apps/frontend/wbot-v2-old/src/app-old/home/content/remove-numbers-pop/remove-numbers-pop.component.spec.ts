import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveNumbersPopComponent } from './remove-numbers-pop.component';

describe('RemoveNumbersPopComponent', () => {
  let component: RemoveNumbersPopComponent;
  let fixture: ComponentFixture<RemoveNumbersPopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RemoveNumbersPopComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveNumbersPopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
