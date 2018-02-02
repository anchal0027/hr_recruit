import * as data from '../../cypress.json';

describe('Setting/Reset Password Page Test', function () {

  it('Visits the Setting/Reset Password Page', function () {
    cy.login(data.email, data.password);
      cy.visit(data.baseUrl+'/core/setting/resetPassword');

    cy.get('form').within(function () {
      cy.get('#oldPass input').should('have.attr', 'placeholder', 'Old Password')
      cy.get('#newPass input').should('have.attr', 'placeholder', 'New Password');
      cy.get('#resetbtn button').should('have.attr', 'ng-reflect-disabled', 'true')
    })
  })

    it('Test Reset Password Api With Wrong Data', function () {
      cy.login(data.email, data.password);
      cy.visit(data.baseUrl+'/core/setting/resetPassword');

      cy.get('form').within(function () {
        cy.get('#oldPass input').type('fakePass').should('have.value', 'fakePass');
        cy.get('#newPass input').type('newfakePass').should('have.value', 'newfakePass');
        cy.get('#resetbtn button').should('have.attr', 'ng-reflect-disabled', 'false');
        cy.get('#resetbtn button').click()
        cy.get('md-card-subtitle').should('have.class', 'mat-card-subtitle').wait(2000);
       })
    })

    it('Test Reset Password Api With right Data', function () {
      cy.login(data.email, data.password);
      cy.visit(data.baseUrl+'/core/setting/resetPassword');
      cy.get('form').within(function () {
        cy.get('#oldPass input').type(data.password).should('have.value', data.password);
        cy.get('#newPass input').type(data.newPassword).should('have.value', data.newPassword);
        cy.get('#resetbtn button').should('have.attr', 'ng-reflect-disabled', 'false')
        cy.get('#resetbtn button').click()
      })
      cy.get('simple-snack-bar').should('have.class', 'mat-simple-snackbar').wait(2000);
      cy.logout()
    })

    it('Test Reset Password Login', function () {
      cy.login(data.email, data.newPassword);
      cy.visit(data.baseUrl+'/core/setting/resetPassword');
      cy.get('form').within(function () {
        cy.get('#oldPass input').type(data.newPassword).should('have.value', data.newPassword);
        cy.get('#newPass input').type(data.password).should('have.value', data.password);
        cy.get('#resetbtn button').should('have.attr', 'ng-reflect-disabled', 'false');
        cy.get('#resetbtn button').click().wait(500);
      });
      cy.get('simple-snack-bar').should('have.class', 'mat-simple-snackbar');
    })
})
