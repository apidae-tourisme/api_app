import {Seed} from "./seed.model";

let seed = null;

describe('Seed model', () => {

  beforeEach(() => {
    seed = new Seed({}, false, false);
  });

  it('should add first connection', () => {
    let added = new Seed({_id: 'b'}, false, false);
    seed.addConnection(added);

    expect(seed.connections).toEqual(['b']);
    expect(seed.seeds).toEqual([added]);
    expect(seed.addedConnections).toEqual(['b']);
    expect(seed.removedConnections.length).toBe(0);
  });

  it('should remove last connection', () => {
    seed.connections = ['b'];
    let removed = new Seed({_id: 'b'}, false, false);
    seed.removeConnection(removed);

    expect(seed.connections.length).toBe(0);
    expect(seed.seeds.length).toBe(0);
    expect(seed.removedConnections).toEqual(['b']);
    expect(seed.addedConnections.length).toBe(0);
  });

  it('should add connections', () => {
    let connection = new Seed({_id: 'a'}, false, false);
    seed.connections = ['a'];
    seed.seeds = [connection];
    let first = new Seed({_id: 'b'}, false, false);
    let second = new Seed({_id: 'c'}, false, false);
    seed.addConnection(first);
    seed.addConnection(second);

    expect(seed.connections).toEqual(['a', 'b', 'c']);
    expect(seed.seeds).toEqual([connection, first, second]);
    expect(seed.addedConnections).toEqual(['b', 'c']);
    expect(seed.removedConnections.length).toBe(0);
  });

  it('should remove connections', () => {
    let first = new Seed({_id: 'a'}, false, false);
    let second = new Seed({_id: 'b'}, false, false);
    let third = new Seed({_id: 'c'}, false, false);
    seed.connections = ['a', 'b', 'c'];
    seed.seeds = [first, second, third];

    seed.removeConnection(first);
    seed.removeConnection(third);

    expect(seed.connections).toEqual(['b']);
    expect(seed.seeds).toEqual([second]);
    expect(seed.removedConnections).toEqual(['a', 'c']);
    expect(seed.addedConnections.length).toBe(0);
  });

  it('should add and remove connections', () => {
    let first = new Seed({_id: 'a'}, false, false);
    let second = new Seed({_id: 'b'}, false, false);
    let third = new Seed({_id: 'c'}, false, false);
    seed.connections = ['a', 'b'];
    seed.seeds = [first, second];

    seed.removeConnection(second);
    seed.addConnection(third);

    expect(seed.connections).toEqual(['a', 'c']);
    expect(seed.seeds).toEqual([first, third]);
    expect(seed.removedConnections).toEqual(['b']);
    expect(seed.addedConnections).toEqual(['c']);
  });

  it('should combine add and remove', () => {
    let first = new Seed({_id: 'a'}, false, false);
    let second = new Seed({_id: 'b'}, false, false);
    let third = new Seed({_id: 'c'}, false, false);
    seed.connections = ['a', 'b'];
    seed.seeds = [first, second];

    seed.removeConnection(second);
    seed.addConnection(third);
    seed.addConnection(second);
    seed.removeConnection(first);

    expect(seed.connections).toEqual(['c', 'b']);
    expect(seed.seeds).toEqual([third, second]);
    expect(seed.removedConnections).toEqual(['a']);
    expect(seed.addedConnections).toEqual(['c']);
  });
});
