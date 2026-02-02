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

    // DATA MAPPING:
    // We create a specific object that matches exactly what the Backend needs.
    const payload = {
        name: this.bookingForm.value.name,        // Maps 'fullName' -> 'name'
        phone: this.bookingForm.value.phone,
        email: this.bookingForm.value.email,
        pickup: this.bookingForm.value.pickupLocation, // Maps 'pickupLocation' -> 'pickup'
        destination: this.bookingForm.value.destination,
        date: this.bookingForm.value.pickupDate,       // Maps 'pickupDate' -> 'date'
        frequency: this.bookingForm.value.frequency,
        timeFrom: this.bookingForm.value.timeFrom,
        timeTo: this.bookingForm.value.timeTo
    };

    this.http.post('https://carlyft-backend.onrender.com/api/leads', payload)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.showSuccess = true;
          this.bookingForm.reset({ frequency: 'Weekly' }); // Reset but keep default
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