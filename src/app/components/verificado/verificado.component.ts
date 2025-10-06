import { Component, OnInit } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';


@Component({
  selector: 'app-verificado',
  imports: [],
  templateUrl: './verificado.component.html',
  styleUrl: './verificado.component.css'
})
export class VerificadoComponent implements OnInit {

  private supabase: SupabaseClient;

  constructor(private router: Router) {
    this.supabase = createClient(
      'https://njczbgmwrauhftlxzejq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qY3piZ213cmF1aGZ0bHh6ZWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjgyNTUsImV4cCI6MjA3NDg0NDI1NX0.MWVNOjHT7iSZI53J9S3LyaItW3ywYv8v9p83hOMvpsY'
    );
  }

  ngOnInit() {
    const fragment = window.location.hash;
    const params = new URLSearchParams(fragment.replace('#', ''));
    const accessToken = params.get('access_token');

    if (accessToken) {
      this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: ''
      });
    }
  }

  enviarLogin() {
    console.log('Redirigiendo al login...');
    this.router.navigate(['/login']);
  }
}

