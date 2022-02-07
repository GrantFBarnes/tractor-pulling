import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-youtube-pull',
  templateUrl: './youtube-pull.component.html',
  styleUrls: ['./youtube-pull.component.css'],
})
export class YoutubePullComponent implements OnInit {
  @Input() pull_youtube: string = '';

  constructor() {}

  ngOnInit(): void {}
}
