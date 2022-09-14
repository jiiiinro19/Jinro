import { recurse } from 'cypress-recurse'
import dayjs from 'dayjs'
describe('GoFastCPA Creating Additional Storage', () => {
    let data;
    beforeEach(function () {
        // "this" points at the test context object
        cy.fixture('test').then((info) => {
        // "this" is still the test context object
            data = info;
        });
    });
    it ('Additional Storage for PAID import pre-assessment', () =>{
        Cypress.on('uncaught:exception', (err, runnable) => {
            //returning false here prevents Cypress from
            // ailing the test
            return false
        })
        cy.visit(data.cpa_url.dev)
        cy.wait(1000)
        cy.get('[id=UserPortal]').click()
        cy.contains('Login').click()
        cy.get('[id=username]').click({force: true}).type(data.client_user.name)
        cy.wait(100)
        cy.get('[id=password]').click({force: true}).type(data.client_user.password)
        cy.wait(100)
        cy.get('[id=kc-login]').click({force: true})
        cy.wait(1000)
        cy.get('[id=NavButton]').click({multiple:true, force:true})
        cy.wait(1000)
        cy.contains('Import Additional Storage').click({force:true})
        cy.wait(1000)
    })
    it('Request additional request storage', () =>{
        cy.get('[id=createNewStorage-id]').click({force:true})
        cy.wait(3000)
        cy.get('[id=TransactionReferenceNo-id]').click({force: true}).type(data.additional_storage.trNO1)
        cy.wait(2000)
        recurse(() => 
        cy.get('tbody').find('tr')
        .contains(data.additional_storage.trNO1)
        .should(() => {}),
        ($result) => $result.length > 0,
        {
            limit: 10, 
            post()
            {
            cy.get('tr').then(($results)=>
            {      
                cy.scrollTo('bottom')
                cy.get('.v-pagination').find('button').then(($btn) => 
                {
                    cy.get(`[aria-label="Next page"]`).click({force:true});
                    cy.log('Trigger ' + $btn);   
                });
            })
            }
        }).scrollIntoView().invoke('css','border','2px solid red',)
        cy.get('tr')
        .contains(data.additional_storage.trNO1)
        .click({force:true})
        cy.intercept({method:'POST', url:'/additionalStorage/search'}).as('getResult');
        cy.wait('@getResult')
        cy.get('.sm5 > :nth-child(1) > .field-value').should('contain',data.additional_storage.trNO1)
        cy.contains(' Request Storage Extension ')
        .click({force: true})
        .then($next =>
        {
            cy.get('tbody > tr > .text-start > .v-data-table__checkbox')
            .find('.v-input--selection-controls__input > .v-input--selection-controls__ripple')
            .click({multiple: true})
            .then($accept =>
                {
                    cy.contains('Accept ').click();
                });
        })
        //cy.contains(/^25$/).click({multiple: true, force:true})
        cy.get('[id=Accept]').click({force: true})
        cy.intercept({method:'POST', url:'import/updateExemption'}).as('getupdateExemption');
        cy.intercept({method:'POST', url:'/wallet/transactions'}).as('getWalletTransactions');
        cy.intercept({method:'POST', url:'/additionalStorageContainer/create'}).as('getResult');
        cy.intercept({method:'POST', url:'additionalStorageContainer/search'}).as('getAdditionalStorageContainer');  
        cy.intercept({method:'POST', url:'/exemption/search'}).as('getExemption');
        cy.wait('@getExemption')
        cy.wait('@getResult')
        cy.wait('@getupdateExemption')
        .its('response.statusCode')
        .should('equal',200);
        cy.wait('@getWalletTransactions')
        .its('response.statusCode')
        .should('equal',200);
        cy.wait(1000)  
        cy.get('.v-data-table__wrapper').find('tbody').then($td=>
        {
        if ($td.find('td.text-center').length > 1)
        {
            cy.get('.text-center')
            .find('div > .v-input__slot').click({showOn: "button",buttonText: "day", multiple: true }).children()
            .then($datePicker =>
            {           
                cy.pause();
                const targetDate = dayjs()
                .add(0, 'year')
                .add(0, 'month')
                .add(0, 'day')
                .format('MM/DD/YYYY')
                cy.get('.v-date-picker-table')
                .find('table')
                .each(($el,index,$list) =>
                    {
                        var dateName = $el.text()
                        if(dateName == targetDate)
                        {
                            // cy.wrap($el).invoke('dateName').click();
                        }
                    })
            }) 
            cy.get('[id=Save]').click({force:true}).then($done =>
                {
                    cy.wait('@getWalletTransactions').its('response.statusCode').should('equal',200);
                    cy.get('.sm7 > :nth-child(5) > .col-sm-7').should('contain','COMPLETE')
                    cy.wait('@getAdditionalStorageContainer')
                    .its('response.statusCode')
                    .should('equal',200);
                });
        }
        else
        {
            cy.get('tbody').contains('No data available');
            cy.get('.sm7 > :nth-child(5) > .col-sm-7').should('contain','INCOMPLETE')
            cy.get('#AddContainer > .v-btn__content').click({force:true})
            cy.intercept({method:'POST', url:'importContainer/search'})
            .as('getimportContainer');
            cy.intercept({method:'POST', url:'additionalStorage/create'})
            .as('getAdditionalStorage');
            cy.wait('@getimportContainer')
            cy.pause();
            // cy.get('.v-input--selection-controls__ripple')
            // .click({force: true,multiple: true})
            cy.contains('[id=Accept]').click({force:true}).wait('@getAdditionalStorage')
            cy.contains('.sm7 > :nth-child(5) > .col-sm-7',/^COMPLETE/)
            // cy.get('div[class="v-input v-input--is-readonly theme--light v-text-field v-text-field--is-booted"]').click({multiple: true})
            cy.pause();
            cy.get('[id=Save]').click({force: true})  
            cy.intercept({method:'POST', url:'/additionalStorage/update'}).as('getAdditionalStorage');
            cy.wait('@getAdditionalStorage')
            cy.contains('.sm7 > :nth-child(5) > .col-sm-7',/^PAID/)
        }
        })
        cy.contains('Apply').click({force: true})
        .wait('@getWalletTransactions')
        .its('response.statusCode')
        .should('equal',200);
        cy.get('.sm7 > :nth-child(5) > .col-sm-7').should('contain','FOR ASSESSMENT')
    })
    it('Log out to GoFASTCpa', () =>{
        cy.get('[id=profileAvatar-id]').click({force: true})
        cy.contains(/^Logout$/).click({force:true})
    })
})
