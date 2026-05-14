declare module 'react-zoom-pan-pinch' {
  import type { ComponentType, ReactNode, CSSProperties } from 'react';

  export type TransformWrapperRenderProps = {
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
  };

  export type TransformWrapperProps = {
    children?: ReactNode | ((props: TransformWrapperRenderProps) => ReactNode);
    initialScale?: number;
    minScale?: number;
    maxScale?: number;
    centerOnInit?: boolean;
    limitToBounds?: boolean;
    wheel?: {
      step?: number;
      smoothStep?: number;
      disabled?: boolean;
      wheelDisabled?: boolean;
      touchPadDisabled?: boolean;
      activationKeys?: string[] | ((keys: string[]) => boolean);
      excluded?: string[];
    };
    pinch?: { step?: number; disabled?: boolean; excluded?: string[] };
    doubleClick?: { disabled?: boolean; step?: number; mode?: string; excluded?: string[] };
    panning?: { velocityDisabled?: boolean; disabled?: boolean; excluded?: string[] };
  };

  export const TransformWrapper: ComponentType<TransformWrapperProps>;
  export const TransformComponent: ComponentType<{
    children?: ReactNode;
    wrapperStyle?: CSSProperties;
    contentStyle?: CSSProperties;
  }>;
}
