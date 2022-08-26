// import { recurse } from 'cypress-recurse'
// import dayjs from 'dayjs'
describe('GoFastCPA Creating Additional Storage', () => {
    let data;
    beforeEach(function () {
        // "this" points at the test context object
        cy.fixture('test').then((info) => {
        // "this" is still the test context object
            data = info;
        });
    });
    it ('Logint', () =>{
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
        cy.get('[id=NavButton]').click({multiple:true, force:true})
        cy.contains('Export Pre-Assessment').click({force:true})
        cy.wait(1000)  
    })
    it('Export additional storage', () =>
    {
    //file to be uploaded path in project folder
    const p = 'test-image-unsplash.jpg'   

        cy.intercept({method:'POST', url:'export/search'}).as('getExport');
        cy.intercept({method:'POST', url:'user/getuserdetails'}).as('getUserDetails');
        cy.intercept({method:'POST', url:'export/updateExemption'}).as('getUpdateExemptions');
        cy.intercept({method:'POST', url:'export/uploadOr'}).as('getUploadOr');
        cy.contains('Create Export Pre-Assessment').click({force:true})
        .wait('@getExport');
        
        cy.get('[id=EncodingForm-id]').click({force:true}).then($container =>
            {
                cy.get('.container.grid-list-md').should('be.visible')
                cy.get('#Transactiontype-id').click().then($le =>
                    {
                        cy.get('.v-list-item__content').contains('Empty').click({force: true})
                    });
                cy.get('#brokerName-id').type('testBroker').wait(100);
                cy.get('#brokerTin-id').type('0123456789').wait(100);
                cy.get('#commodity-id').type('testCommodity').wait(100);
                cy.get('.container.grid-list-md').find('#EDNo-id').type('testEDNo').wait(100);
                cy.get('#VesselNo-id').type('testVesselNo').wait(100);
                cy.get('#arrastre-id').clear().type('5').wait(100);
            })
        // cy.intercept({method:'GET', url:'user/getuserdetails'}).as('getUserdetails');
        // cy.wait('@getUserdetails')
        // .its('response.statusCode')
        // .should('equal',200);

        // cy.get('#withHoldingTax-id1').click().then($le =>
        //     {
        //         cy.get('.v-list-item__content').contains('Empty').click({force: true})
        //     });
        cy.pause();
        cy.contains('Save').click({force:true});
        cy.get('.v-dialog__content--active > .v-dialog > .v-card > .v-card__text').should('contain','Successfully Created Export Pre-Assessment');
        cy.get('#OK-id').click()
        .wait('@getUpdateExemptions')
        .its('response.statusCode')
        .should('equal',200);
        //upload file with attachFile
        cy.get('#file1').attachFile(p) //change id: 'file1' to 'file-upload'
        //click on upload
        cy.get('#Upload1').click();
        cy.get('.v-dialog__content--active > .v-dialog > .v-card > .v-card__text').should('contain','Successfully Uploaded OR for Export Pre-Assessment.');
        cy.get('#OK-id').click({force: true})
        .wait('@getUploadOr')
        .its('response.statusCode')
        .should('equal',200);
        cy.get('.v-data-table__wrapper').find('tbody').then($td=>
            {
            if ($td.find('td.text-center').length > 1)
            {
                cy.get('.text-center')
                .find('div > .v-input__slot').click({showOn: "button",buttonText: "day"}).children()
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
                                cy.wrap($el).invoke('dateName').click();
                            }
                        })
                }) 
                cy.get('.v-btn__content').then($done =>
                    {
                        cy.get('.sm7 > :nth-child(5) > .col-sm-7').should('contain','COMPLETE')
                    });
               
                
            }
            else
            {
                cy.get('tbody').contains('No data available');
                cy.get('[data-cy="create-account"]').click({force:true}).then($container =>
                    {
                        cy.get('.container.grid-list-md').should('be.visible')
                        cy.get('#ContainerNo-id').type('0001').wait(100);
                        cy.get('#Size-id').click().then(() =>
                        {
                            cy.get('.v-list-item__content').contains('20').click({force: true})
                        });
                        cy.get('#Bulk-id').type('1').wait(100);
                        cy.get('#DG-id').type('1').wait(100);
                        cy.get('#OC-id').type('1').wait(100);
                        cy.pause();
                        cy.get('#Save-id').click({force:true});
                    })
            }
            })
    })
    it('Log out to GoFASTCpa', () =>{
        cy.get('[id=profileAvatar-id]').click({force: true})
        cy.contains(/^Logout$/).click({force:true})
    })

})
