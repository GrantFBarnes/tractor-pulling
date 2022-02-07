import { Tractor } from 'src/app/shared/interfaces/tractor';
import { Puller } from 'src/app/shared/interfaces/puller';
import { Location } from 'src/app/shared/interfaces/location';
import { Season } from 'src/app/shared/interfaces/season';
import { Pull } from 'src/app/shared/interfaces/pull';
import { Class } from 'src/app/shared/interfaces/class';
import { Hook } from 'src/app/shared/interfaces/hook';

export function time(a: any, b: any): number {
  const a_val = new Date(a);
  const b_val = new Date(b);
  if (a_val < b_val) return -1;
  if (a_val > b_val) return 1;
  return 0;
}

export function tractor(a: Tractor, b: Tractor): number {
  const a_val = a.brand + ' ' + a.model;
  const b_val = b.brand + ' ' + b.model;
  if (a_val < b_val) return -1;
  if (a_val > b_val) return 1;
  return 0;
}

export function puller(a: Puller, b: Puller): number {
  const a_val = a.last_name + ', ' + a.first_name;
  const b_val = b.last_name + ', ' + b.first_name;
  if (a_val < b_val) return -1;
  if (a_val > b_val) return 1;
  return 0;
}

export function location(a: Location, b: Location): number {
  const a_val = a.town + ', ' + a.state;
  const b_val = b.town + ', ' + b.state;
  if (a_val < b_val) return -1;
  if (a_val > b_val) return 1;
  return 0;
}

export function season(a: Season, b: Season): number {
  const a_val = parseInt(a.year);
  const b_val = parseInt(b.year);
  if (a_val < b_val) return 1;
  if (a_val > b_val) return -1;
  return 0;
}

export function pull(a: Pull, b: Pull): number {
  const a_val = a.date;
  const b_val = b.date;
  if (a_val < b_val) return 1;
  if (a_val > b_val) return -1;
  return 0;
}

function sortClass(
  a_weight: number,
  b_weight: number,
  a_category: string,
  b_category: string
): number {
  if (a_weight < b_weight) return -1;
  if (a_weight > b_weight) return 1;
  if (a_category < b_category) return 1;
  if (a_category > b_category) return -1;
  return 0;
}

export function className(a: string, b: string): number {
  const a_split = a.split(' ');
  const b_split = b.split(' ');
  const a_weight = parseInt(a_split[0]);
  const b_weight = parseInt(b_split[0]);
  const a_category = a_split[1];
  const b_category = b_split[1];
  return sortClass(a_weight, b_weight, a_category, b_category);
}

export function classExcel(a: any, b: any): number {
  return className(a.name, b.name);
}

export function classObj(a: Class, b: Class): number {
  const a_weight = a.weight;
  const b_weight = b.weight;
  const a_category = a.category;
  const b_category = b.category;
  return sortClass(a_weight, b_weight, a_category, b_category);
}

function sortHook(a_position: number, b_position: number): number {
  if (a_position < b_position) return -1;
  if (a_position > b_position) return 1;
  return 0;
}

export function hookExcel(a: any, b: any): number {
  return sortHook(a.position, b.position);
}

export function hookObj(a: Hook, b: Hook): number {
  return sortHook(a.position, b.position);
}
