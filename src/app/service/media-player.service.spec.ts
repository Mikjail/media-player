import { TestBed } from '@angular/core/testing';

import { MediaPlayerService } from './media-player.service';

describe('MediaPlayerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MediaPlayerService = TestBed.get(MediaPlayerService);
    expect(service).toBeTruthy();
  });
});
