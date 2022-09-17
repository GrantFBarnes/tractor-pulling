import { Tractor } from 'src/app/shared/interfaces/tractor';
import { Puller } from 'src/app/shared/interfaces/puller';
import { Location } from 'src/app/shared/interfaces/location';
import { Season } from 'src/app/shared/interfaces/season';
import { Pull } from 'src/app/shared/interfaces/pull';
import { Class } from 'src/app/shared/interfaces/class';

export function getTractorStr(tractor: Tractor): string {
  if (!tractor) return '(Unknown)';
  return tractor.brand + ' ' + tractor.model;
}

export function getPullerStr(puller: Puller, inverse: boolean): string {
  if (!puller) return '(Unknown)';
  if (inverse) return puller.last_name + ', ' + puller.first_name;
  return puller.first_name + ' ' + puller.last_name;
}

export function getLocationStr(location: Location): string {
  if (!location) return '(Unknown)';
  return location.town + ', ' + location.state;
}

export function getSeasonStr(season: Season): string {
  if (!season) return '(Unknown)';
  return season.year;
}

function padDate(i: number): string {
  return i < 10 ? '0' + i : '' + i;
}

export function getDateStr(ds: string): string {
  const d = new Date(ds);
  return (
    d.getUTCFullYear() +
    '-' +
    padDate(d.getMonth() + 1) +
    '-' +
    padDate(d.getDate())
  );
}

export function getPullStr(
  pull: Pull,
  locations: { [id: string]: Location }
): string {
  if (!pull) return '(Unknown)';
  if (!pull.id) return 'All';
  let str = getDateStr(pull.date);
  const loc = locations[pull.location];
  if (loc) {
    str += ' - ' + loc.town + ', ' + loc.state;
  }
  if (pull.youtube) {
    str += ' - (video)';
  }
  return str;
}

export function getClassStr(c: Class): string {
  if (!c) return '(Unknown)';
  if (!c.id) return 'All';
  let str = c.weight + ' ' + c.category;
  if (c.speed != 3) str += ' (' + c.speed + ')';
  return str;
}
