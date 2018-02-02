import { Component, OnInit, OnDestroy, ViewEncapsulation, NgZone, trigger, state, animate, transition, style } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdDialog, MdDialogConfig, MdDialogRef } from '@angular/material';
import { ImapMailsService } from '../../service/imapemails.service';
import { OpenattachementComponent } from '../openattachement/openattachement.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { ScheduleInterviewComponent } from './../schedule-interview/schedule-interview.component';
import { CommonService } from './../../service/common.service';
import { LocalStorageService } from './../../service/local-storage.service';
import { DialogService } from './../../service/dialog.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ComposeEmailComponent } from './../compose-email/compose-email.component';
import { AddNoteComponent } from './../add-note/add-note.component';

@Component({
    selector: 'app-email-modal',
    templateUrl: './email-modal.component.html',
    styleUrls: ['./email-modal.component.scss'],
    encapsulation: ViewEncapsulation.Native,
    animations: [
        trigger('collapseChange', [
            state('true',
                style({ height: '0', overflow: 'hidden' }),
            ),
            state('false',
                style({ height: '*' })
            ),
            transition('* => *', animate('.25s ease-in'))
        ])
    ]
})
export class EmailModalComponent implements OnInit, OnDestroy {
    dialogConfig: MdDialogRef<any>;
    dialogRef: MdDialogRef<any>;
    email: any;
    tags: any;
    body: any;
    historyList: any;
    selectedTag: any;
    selectedEmail: any;
    idlist: string[];
    error = false;
    errorMessageText: string;
    dataForInterviewScheduleRound: any;
    inboxMailsTagsForEmailListAndModel: any;
    noteData: any;
    updatedData: any
    user: any;
    mongoid: any;
    constructor(public _location: Location, private route: ActivatedRoute, private router: Router, public setvardialog: MdDialog, private ngZone: NgZone, sanitizer: DomSanitizer, private tagUpdate: ImapMailsService, public dialog: MdDialog, public commonService: CommonService, public _localStorageService: LocalStorageService, public _dialogService: DialogService) {
        this.email = this._localStorageService.getItem('email');
        if (!this._localStorageService.getItem('selectedTag')) {
            this.selectedTag = -1;
        } else {
            this.selectedTag = this._localStorageService.getItem('selectedTag');
        }
        this.tags = this._localStorageService.getItem('tags');
        this.dataForInterviewScheduleRound = this._localStorageService.getItem('dataForInterviewScheduleRound');
        this.inboxMailsTagsForEmailListAndModel = this._localStorageService.getItem('inboxMailsTagsForEmailListAndModel');
    }

    ngOnInit() {
        document.getElementById('topnav').classList.add('sidehide');
        document.getElementById('leftPart').classList.add('sidehide');
        document.getElementById('rightPart').classList.add('fullwidth');
        this.selectedEmail = this.email;
        this.historyList = [];
        this.idlist = [];
        this.user = this._localStorageService.getItem('userEmail');
        this.body = {
            'status': false,
            'mongo_id': this.route.snapshot.paramMap.get('id')
        };
        if (this.selectedEmail.attachment && this.selectedEmail.attachment.length === 0 && this.selectedEmail.is_attachment) {
            this.tagUpdate.emailAttachment(this.body.mongo_id).subscribe((data) => {
                this.showEmail(data.data);
                this.getCandiatehistory();
            }, (err) => {
                this.error = true;
                this.errorMessageText = err.message;
            });
        }
        this.getCandiatehistory();
        if (document.getElementsByClassName('mat-sidenav-content').length > 0) {
            setTimeout(() => {
                document.getElementsByClassName('mat-sidenav-content')[0].scrollTo(0, 0);
            }, 100);
        }
    }
    ngOnDestroy() {
        document.getElementById('topnav').classList.remove('sidehide');
        document.getElementById('leftPart').classList.remove('sidehide');
        document.getElementById('rightPart').classList.remove('fullwidth');
    }

    getCandiatehistory() {
        if (this.email.sender_mail) {
            this.getCandidateHistoryApi(this.email.sender_mail);
        } else {
            this.getCandidateHistoryApi(this.email._id);
        }
    }

    getCandidateHistoryApi(apiData) {
        this.tagUpdate.getCandidateHistory(apiData).subscribe((data) => {
            this.historyList = this.commonService.formateEmailHistoryData(data, this.route.snapshot.paramMap.get('id'));
            this._localStorageService.setItem('email', this.historyList['data'][0]);
        }, (err) => {
            console.log(err);
        });
    }

    showEmail(singlemail: any) {
        this.selectedEmail = '';
        this.selectedEmail = singlemail;
    }

    openAccordian(singleEmail) {
        this.selectedEmail = '';
        this.selectedEmail = singleEmail;
        if (this.selectedEmail.attachment && this.selectedEmail.attachment.length === 0 && this.selectedEmail.is_attachment) {
            this.getEmailAttachment(this.selectedEmail);
        }
        for (let i = 0; i < this.historyList['data'].length; i++) {
            if (this.historyList['data'][i]['_id'] === singleEmail['_id']) {
                if (this.historyList['data'][i]['accordianIsOpen']) {
                    this.historyList['data'][i]['accordianIsOpen'] = false;
                } else {
                    this.historyList['data'][i]['accordianIsOpen'] = true;
                }
            } else {
                // do not delete this is for close all other accordian
                // this.historyList['data'][i]['accordianIsOpen'] = false;
            }
        }
    }

    getEmailAttachment(email) {
        const index = _.findIndex(this.historyList['data'], email)
        this.tagUpdate.emailAttachment(email['_id']).subscribe((data) => {
            this.historyList['data'][index] = data['data'];
            this.historyList['data'][index]['accordianIsOpen'] = true;
        }, (err) => {
            this.error = true;
            this.errorMessageText = err.message;
        });
    }

    assignTag(id: string, emailId, title: string, emailData) {
        if (title === 'Schedule') {
            this._dialogService.openScheduleInterview({ 'tagId': id, 'emailId': emailId, 'dataForInterviewScheduleRound': this.dataForInterviewScheduleRound, 'tagselected': this.selectedTag, 'emailData': emailData }).then((data: any) => {
                if (data && data.tag_id) {
                    this.tagUpdate.assignTag(data).subscribe((res) => {
                        this.commonService.inboxRefreshEvent();
                    }, (err) => {
                        console.log(err);
                    });
                    this._location.back();
                }
            }, (err) => {
                console.log(err);
            });
        } else {
            this.body = null;
            this.idlist.push(emailId);
            this.body = {
                'tag_id': id,
                'mongo_id': this.idlist
            };
            this.tagUpdate.assignTag(this.body).subscribe((data) => {
                this.idlist = [];
                this.commonService.inboxRefreshEvent();
            }, (err) => {
                console.log(err);
            });
            this._location.back();
        }
    }

    openAttachment(link: string) {
        this.dialogConfig = this.setvardialog.open(OpenattachementComponent, {
            height: '100%',
            width: '120%'
        });
        this.dialogConfig.componentInstance.link = link;
        this.dialogConfig.afterClosed().subscribe(result => {
            this.dialogConfig = null;
        });
    }

    back() {
        this._location.back();
    }

    getColor(title) {
        return this.commonService.getDefaultTagColor(title);
    }

    getIcon(title) {
        return this.commonService.getDefaultTagIcon(title);
    }

    historyListDataTrack(index, data) {
        return data['_id'] || index;
    }

    tagsDefaultTrack(index, data) {
        return data['id'] || index;
    }

    inboxMailsTagsForEmailListAndModelDataTrack(index, data) {
        return data['id'] || index;
    }

    H_emailAttachmentTrack(index, data) {
        return index;
    }

    sendEmail() {
        this.dialogRef = this.dialog.open(ComposeEmailComponent, {
            height: '90%',
            width: '70%'
        });
        this.dialogRef.componentInstance.emailList = [this.email['sender_mail']];
        this.dialogRef.componentInstance.subject_for_genuine = localStorage.getItem('subject_for_genuine');
        this.dialogRef.afterClosed().subscribe(result => {
            this.dialogRef = null;
        });
    }
    addNote(candidateid: any) {
        this.dialogRef = this.dialog.open(AddNoteComponent, {
            height: '30%',
            width: '30%'
        });
        this.dialogRef.componentInstance.candidateid = candidateid;
        this.dialogRef.componentInstance.emailList = this.historyList;
        this.dialogRef.afterClosed().subscribe(result => {
            const date = moment(new Date()).format('DD-MM-YYYY');
            const time = moment(new Date()).format('hh:mm:ss a');
            for (let i = 0; i <= this.historyList.data.length; i++) {
                if (this.historyList.data[i]._id === result.notedata.mongo_id) {
                    this.historyList.data[i].notes.push({'note': result.notedata.note, 'date': date, 'assignee': this.user, 'time': time})
                }
            }
            this.dialogRef = null;
        });
    }

    eventHandler(event, notedate, notetime, mongoid) {
        this.mongoid = mongoid;
        this.updatedData = {note: event.target.outerText, mongo_id: mongoid, note_date: notedate, note_time: notetime
        }
    }
    update(event, i) {
        if (this.updatedData !== undefined) {
            this.tagUpdate.updateNote(this.updatedData).subscribe((data) => {}, (err) => {
                this.error = true;
                this.errorMessageText = err.message;
            });
            const date = moment(new Date()).format('DD-MM-YYYY');
            const time = moment(new Date()).format('hh:mm:ss a');
            for (let j = 0; j <= this.historyList.data.length; j++) {
                if (this.historyList.data[j]._id === this.mongoid) {
                    this.historyList.data[j].notes[i] = ({
                        'note': this.updatedData.note,
                        'date': date,
                        'assignee': this.user,
                        'time': time
                    })
                }
            }

        }
    }

}
