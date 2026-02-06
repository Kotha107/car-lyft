import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html' // Make sure this matches your file name
})
export class LeadFormComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  // Updated Form Definition
  bookingForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{7,}$/)]],
    email: ['', [Validators.required, Validators.email]],
    pickupLocation: ['', Validators.required],
    destination: ['', Validators.required],
    pickupDate: [new Date().toISOString().split('T')[0], Validators.required],
    
    // NEW FIELDS
    frequency: ['Weekly', Validators.required], // Defaults to Weekly
    timeFrom: ['', Validators.required],
    timeTo: ['', Validators.required],
    
    terms: [false, Validators.requiredTrue]
  });

  isLoading = false;
  showSuccess = false;
  showError = false;

 onSubmit() {
    console.log('Form Submitted', this.bookingForm.value);
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.showError = false;

    // DATA MAPPING
    const payload = {
        name: this.bookingForm.value.name,
        phone: this.bookingForm.value.phone,
        email: this.bookingForm.value.email,
        pickup: this.bookingForm.value.pickupLocation,
        destination: this.bookingForm.value.destination,
        date: this.bookingForm.value.pickupDate,
        frequency: this.bookingForm.value.frequency,
        timeFrom: this.bookingForm.value.timeFrom,
        timeTo: this.bookingForm.value.timeTo
    };

    // 👇 YOUR NEW GOOGLE SCRIPT URL 👇
    const googleUrl = 'https://script.google.com/macros/s/AKfycbxy_lgugyH3zOE9e1uEl16hFfNKAROaofgtoehhQr0pNBQryVu3DX7dlzFN9AsCN273/exec';
    // ⚠️ IMPORTANT: We must use JSON.stringify and text/plain headers 
    // to prevent Google from blocking the request (CORS error).
    this.http.post(googleUrl, JSON.stringify(payload), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).subscribe({
        next: () => {
          this.isLoading = false;
          this.showSuccess = true;
          this.bookingForm.reset({ frequency: 'Weekly' });
          setTimeout(() => this.showSuccess = false, 5000);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.showError = true;
          setTimeout(() => this.showError = false, 5000);
        }
    });
  }
}