import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http/http.service';

@Component({
  selector: 'app-excel-upload',
  templateUrl: './excel-upload.component.html',
  providers: [HttpService],
  styleUrls: ['./excel-upload.component.css'],
})
export class ExcelUploadComponent implements OnInit {
  file: any = null;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {}

  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
    } else {
      this.file = null;
    }
  }

  upload(): void {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.httpService
        .post('/api/pulling/excel/upload', { file_binary: event.target.result })
        .subscribe({
          next: () => window.location.reload(),
          error: () => alert('Failed to upload file'),
        });
    };
    reader.readAsBinaryString(this.file);
  }
}
