// CM: there are actually no definition of 'ohlcv' data.
// It is just data: [[<timestamp>, <any>, <any>, .....] , .... ]
// Probably any[][] ???

// BS: Would like to look into whether eliminating `any` is possible, but looks good for now.

// OVERLAY OBJECT

type OverlaySettings = {
  // CM: dataView etc, do we need em here?
  display?: boolean;
  scale?: string;
  precision?: number;
  zIndex?: number;
};

type Overlay = {
  name: string;
  type: string;
  main?: boolean;
  data: any[][]; //TODO: fix, not completely accurate based on what I see in README
  settings?: OverlaySettings;
  props?: Object;
};

// PANE OBJECT

type Scale = {
  precision?: number;
};

type PaneSettings = {
  scales?: { [key: string]: Scale };
  scaleTemplate?: string[][]; // [['B', …], ['A', …]] ???
  scaleIndex?: string;
  scaleSideIdxs?: [];
  height?: number;
};

type Pane = {
  id: number; // CM: for example, this is generated by the lib. Should we include it?
  uuid: string;
  overlays: Overlay[];
  settings: PaneSettings;
};

// THE TOP LEVEL

export type Data = {
  indexBased: boolean; // new
  panes: Pane[];
};

// INTERFACE

export type ColorsObj = { [key: string]: string }; //TODO: specify valid color keys

export type ChartConfig = { [key: string]: any };

export type NightVisionProps = {
  id?: string;
  width?: number;
  height?: number;
  colors?: ColorsObj;
  showLogo?: boolean;
  scripts?: string[]; // CM: array of strings
  data?: Data;
  config?: ChartConfig[];
  indexBased?: boolean;
  timezone?: number;
  autoResize?: boolean;
};
