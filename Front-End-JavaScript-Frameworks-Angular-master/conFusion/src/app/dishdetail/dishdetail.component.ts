import { Component, OnInit, Input, Inject } from '@angular/core';
import { Dish } from '../shared/dish';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { DishService } from '../services/dish.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

import { switchMap } from 'rxjs/operators';
import { visibility } from '../animations/app.animation';

@Component({
    selector: 'app-dishdetail',
    templateUrl: './dishdetail.component.html',
    styleUrls: ['./dishdetail.component.scss'],
    animations: [visibility()]
})
export class DishdetailComponent implements OnInit {

    dish: Dish;

    errMess: string;

    commentForm: FormGroup;
    comment: Comment;

    dishIds: number[];
    prev: number;
    next: number;


    dishcopy = null;
    visibility = 'shown';

    formErrors = {
        'author': '',
        'comment': '',
    };

    validationMessages = {
        'author': {
            'required': 'Author Name is required.',
            'minlength': 'Author Name must be at least 2 characters long.'
        },
        'comment': {
            'required': 'Comment is required.'
        }
    };



    constructor(private dishservice: DishService,
        private route: ActivatedRoute,
        private location: Location, private fb: FormBuilder,
        @Inject('BaseURL') private BaseURL) {
        this.createForm();
    }


    ngOnInit() {
        this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);

        this.route.params.pipe(switchMap((params: Params) => {
            this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']);
        })).subscribe(dish => {
            this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown';
        },
            errmess => this.errMess = <any>errmess);
    }


    setPrevNext(dishId: number) {
        const index = this.dishIds.indexOf(dishId);
        this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
        this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }



    goBack(): void {
        this.location.back();
    }

    createForm() {
        this.commentForm = this.fb.group({
            comment: ['', [Validators.required]],
            rating: "5",
            author: ['', [Validators.required, Validators.minLength(2)]],
        });
        this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    }

    onValueChanged(data?: any): any {
        if (!this.commentForm) { return; }
        const form = this.commentForm;
        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                // clear previous error message (if any)
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && control.dirty && !control.valid) {
                    const messages = this.validationMessages[field];
                    for (const key in control.errors) {
                        if (control.errors.hasOwnProperty(key)) {
                            this.formErrors[field] += messages[key] + ' ';
                        }
                    }
                }
            }
        }
    }

    onSubmit() {
        this.comment = this.commentForm.value;
        console.log(this.comment);
        this.dishcopy.comments.push(this.comment);
        this.dishcopy.save()
            .subscribe(dish => { this.dish = dish; console.log(this.dish); });
        this.commentForm.reset();
    }

}