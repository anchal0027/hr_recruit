import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { ImapMailsService } from '../../service/imapemails.service';
import { NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-template-edit',
    templateUrl: './template-edit.component.html',
    styleUrls: ['./template-edit.component.scss']
})
export class TemplateEditComponent implements OnInit {
    userVar: any;
    sysVar: any;
    updateData: any;
    ckeditorContent: any;
    tempName: string;
    subject: string;
    temp: any;
    subject_for_genuine: string;
    production: boolean;
    constructor(public dialogRef: MdDialogRef<any>, private getVariable: ImapMailsService) {
    }

    ngOnInit() {
        this.production = environment['production']
        this.tempName = this.temp.templateName;
        this.subject = this.temp.subject;
        this.ckeditorContent = this.temp.body;
        this.subject_for_genuine = localStorage.getItem('subject_for_genuine');
    }

    update(form: NgForm) {
        this.updateData = {
            'templateName': this.tempName,
            'subject': this.subject,
            'body': this.ckeditorContent
        };
        this.getVariable.updateTemplate(this.updateData, this.temp.id).subscribe((data) => {
            form.reset();
            this.dialogRef.close('updated');
        }, (err) => {
            console.log(err);
        });
    }

    close() {
        this.dialogRef.close();
    }
}
