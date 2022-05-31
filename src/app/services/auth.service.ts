import {Injectable} from "@angular/core";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";
import {ActivatedRoute, Router, NavigationEnd} from "@angular/router";
import {delay, map, Observable, of} from "rxjs";
import {filter, switchMap} from "rxjs/operators";

export interface UserModel {
    id?: string;
    email: string;
    password?: string;
    age: number;
    name: string;
    phone_number: string;
    photo_url?: string;
}

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private usersCollection: AngularFirestoreCollection<UserModel>;
    isAuthenticated$: Observable<boolean>;
    isAuthenticatedWithDelay$: Observable<boolean>;
    private redirect = false;

    constructor(
        private auth: AngularFireAuth, //
        private db: AngularFirestore,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.usersCollection = db.collection("users");
        this.isAuthenticated$ = auth.user.pipe(
            map((user) => !!user) //
        );
        this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
            delay(2000) //
        );

        // Filtering the events from the router
        this.router.events
            .pipe(
                filter((e) => e instanceof NavigationEnd), //
                map((e) => this.route.firstChild),
                switchMap((route) => route?.data ?? of({}))
            )
            .subscribe((data) => {
                this.redirect = data.authOnly ?? false;
            });
    }

    async createUser(userData: UserModel) {
        const userCred = await this.auth.createUserWithEmailAndPassword(
            userData.email, //
            userData.password
        );
        await this.usersCollection.doc(userCred.user?.uid).set({
            name: userData.name,
            email: userData.email,
            age: userData.age,
            phone_number: userData.phone_number,
        });

        // This is optional as we save a users profile in the database
        await userCred.user.updateProfile({
            displayName: userData.name,
            // photoURL: userData.photo_url
        });
    }

    async login(email: string, password: string) {
        return await this.auth.signInWithEmailAndPassword(email, password);
    }

    async logout($event?: Event) {
        // Prevents anchor tags href from trying to redirect
        $event.preventDefault();
        // Logs user out
        await this.auth.signOut();

        if (this.redirect) {
            await this.router.navigateByUrl("/");
        }
    }
}
