import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http/http.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  providers: [HttpService],
  styleUrls: ['./unauthorized.component.css'],
})
export class UnauthorizedComponent implements OnInit {
  @Output() authorizeEvent = new EventEmitter();
  manager_secret: string = '';

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {}

  submit(): void {
    this.httpService
      .post('/api/authentication/manager', {
        manager_secret: this.manager_secret,
      })
      .subscribe({
        next: () => this.authorizeEvent.emit(),
        error: () => alert('Access Denied'),
      });
  }
}
