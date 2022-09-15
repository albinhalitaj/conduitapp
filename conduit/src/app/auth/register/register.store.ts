import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { exhaustMap, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, RegisterForm } from '../../api.service';

interface RegisterState {
  errors: Array<string> | null;
}

const initialState: RegisterState = {
  errors: null,
};

@Injectable()
export class RegisterStore extends ComponentStore<RegisterState> {
  readonly errors$: Observable<Array<string> | null> = this.select(
    (s: RegisterState) => s.errors
  );

  readonly register = this.effect<RegisterForm>(
    exhaustMap((registerForm: RegisterForm) => {
      return this.apiService.register(registerForm).pipe(
        tapResponse(
          () => {
            void this.router.navigate(['/login']);
          },
          (errorResponse: HttpErrorResponse) => {
            if (errorResponse.status == 0) {
              this.setState({
                errors: ['Unable to reach the server. Please try again!'],
              });
            } else {
              const { title } = errorResponse.error;
              const errors = new Array<string>();
              if (title.startsWith('One or more')) {
                Object.values(errorResponse.error.errors).forEach(
                  (error: any) => {
                    errors.push(error as string);
                  }
                );
              } else {
                errors.push(title);
              }
              this.setState({ errors });
            }
          }
        )
      );
    })
  );

  constructor(private apiService: ApiService, private router: Router) {
    super(initialState);
  }
}
