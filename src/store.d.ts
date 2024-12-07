import { RootState, AppDispatch } from "./store";

// Extend the `useDispatch` and `useSelector` hooks to use the correct types

declare module "react-redux" {
  export function useDispatch(): AppDispatch;
  export function useSelector<TSelected = unknown>(
    selector: (state: RootState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean,
  ): TSelected;
}
