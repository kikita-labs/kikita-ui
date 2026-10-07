import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { StorageAdapter } from './storage';

describe('StorageAdapter', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads, writes and removes values in the browser', () => {
    const storage = TestBed.inject(StorageAdapter);

    expect(storage.read('key')).toBeNull();
    storage.write('key', 'value');
    expect(storage.read('key')).toBe('value');
    storage.remove('key');
    expect(storage.read('key')).toBeNull();
  });

  it('does nothing on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    localStorage.setItem('key', 'value');
    const storage = TestBed.inject(StorageAdapter);

    expect(storage.read('key')).toBeNull();
    storage.write('other', 'value');
    expect(localStorage.getItem('other')).toBeNull();
  });

  it('swallows errors from blocked storage', () => {
    const storage = TestBed.inject(StorageAdapter);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(storage.read('key')).toBeNull();
    expect(() => storage.write('key', 'value')).not.toThrow();
    expect(() => storage.remove('key')).not.toThrow();
  });
});
