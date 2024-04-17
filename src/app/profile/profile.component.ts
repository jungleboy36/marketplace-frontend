import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser'; // Import DomSanitizer for safe HTML

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: []
})
export class ProfileComponent implements OnInit {
  userProfile: any;
  uid!: string | null;
  profileForm!: FormGroup;
  profileImageBase64: string | null = null; // Store Base64 image
  maxImageSizeKB = 850; // Maximum allowed Base64 image size in KB

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer, // Inject DomSanitizer
  ) {}

  ngOnInit() {
    // Fetch the logged-in user ID from the AuthService
    this.uid = this.authService.getUserId();

    // Initialize the profile form
    this.initForm();

    // Fetch the user profile data
    this.profileService.getUserProfile(this.uid!).subscribe(
      data => {
        this.userProfile = data;

        // Populate the form with user data
        this.profileForm.patchValue(this.userProfile);

        // If image exists, set it as Base64 format
        if (data.image) {
          this.profileImageBase64 = data.image;
        }
      },
      error => {
        console.error('Error fetching user profile', error);
      }
    );
  }

  // Initialize the form
  initForm() {
    this.profileForm = this.fb.group({
      name: [this.userProfile?.name || '', Validators.required],
      bio: [this.userProfile?.bio || ''],
      phone: [this.userProfile?.phone || ''],
      city: [this.userProfile?.city || ''],
      email: [{ value: this.userProfile?.email || '', disabled: true }], // Email is read-only
      image: [null] // Use a file input for the image
    });
  }

  // Method to handle profile image file input change
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Create a FileReader
        const reader = new FileReader();

        reader.onload = () => {
          // Assign the Base64 string to the profileImageBase64 variable
          this.profileImageBase64 = reader.result as string;

          // Calculate the size of the Base64 image in kilobytes
          const base64Length = this.profileImageBase64.length;
          const imageSizeKB = (base64Length * 3 / 4) / 1024;

          // Check if the image size exceeds the maximum limit
          if (imageSizeKB > this.maxImageSizeKB) {
            Swal.fire({
              title: 'Image too large',
              text: `The image size exceeds the maximum limit of ${this.maxImageSizeKB} KB. Please choose a smaller image.`,
              icon: 'warning',
              confirmButtonText: 'OK'
            });

            // Clear the image input
            this.profileForm.get('image')?.setValue(null);
            this.profileImageBase64 = null;
          } else {
            // Update the profile form with the Base64 encoded image
            this.profileForm.get('image')?.setValue(this.profileImageBase64);
          }
        };

        // Read the file as a Data URL (Base64 format)
        reader.readAsDataURL(file);
    }
  }

  // Method to handle profile form submission
  onSubmitProfileForm() {
    if (this.profileForm.valid) {
        // Get the form data
        const updatedData = this.profileForm.value;

        // Include the profile image data if available
        if (this.profileImageBase64) {
          updatedData.image = this.profileImageBase64;
        }

        // Update the user profile data
        this.profileService.updateUserProfile(this.uid!, updatedData).subscribe(
            () => {
                // Profile updated successfully
                Swal.fire({
                    title: 'Success!',
                    text: 'Profile updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reload the data after the alert is closed
                    this.loadProfileData();
                });
            },
            error => {
                // Error updating user profile
                console.error('Error updating user profile', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error updating profile',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        );
    } else {
        console.error('Form is not valid');
        Swal.fire({
            title: 'Invalid form',
            text: 'Please correct the errors in the form',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
    }
}

// Method to reload profile data
loadProfileData() {
    this.profileService.getUserProfile(this.uid!).subscribe(
        data => {
            this.userProfile = data;
            // Populate the form with the updated user data
            this.profileForm.patchValue(this.userProfile);
        },
        error => {
            console.error('Error fetching user profile', error);
        }
    );
}
}
