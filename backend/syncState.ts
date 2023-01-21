import memoize from "proxy-memoize"; // caches state derivations
import { produce } from "immer"; // allows to transform state in an immutable way
import { compare, Operation } from "fast-json-patch"; // find delta between two objects
import { Id } from "../shared/types";

type Store = {
  connectedClients: Record<Id, ClientState>;
};

type ClientState = {
  id: Id;
  connectedTo?: {
    isMaster: boolean;
    otherId: Id;
    otherRtcDescription?: string;
    otherLastIceCandidate?: string | null;
  };
};

// single source of truth, every info should be derived from the store
let store: Store = {
  connectedClients: {},
};
// make store immutable
produce(store, (draft) => draft);

type Observer<T> = {
  selector: (s: Store) => T;
  prevValue: T;
  onChange: (newValue: T, diff: Operation[]) => void;
};

// observers are called when the store changes
const observers = new Set<Observer<any>>();
function addObserver<T>(
  selector: (s: Store) => T,
  onChange: (newValue: T, diff: Operation[]) => void
) {
  const observer = { selector, prevValue: selector(store), onChange };
  observers.add(observer);
  onChange(observer.prevValue, []);
  return () => observers.delete(observer);
}

// transforms the store and triggers observers
function mutState(fn: (draft: Store) => void) {
  const newStore = produce(store, fn);

  if (newStore === store) return;
  store = newStore;

  observers.forEach((observer) => {
    const newValue = observer.selector(store);
    const diff = compare(observer.prevValue, newValue);
    if (diff.length > 0) {
      observer.onChange(newValue, diff);
      observer.prevValue = newValue;
    }
  });
}

// get the read-only store
function getState() {
  return store;
}

export type { ClientState };
export { getState, mutState, addObserver };
