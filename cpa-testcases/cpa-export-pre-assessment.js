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
        cy.intercept({method:'POST', url:'wallet/transactions'}).as('getWalletTransaction');
        cy.intercept({method:'POST', url:'exportStorage/search'}).as('getExportStorage');
        cy.intercept({method:'POST', url:'user/listUserRoles'}).as('getUserListUserRoles');
        
        cy.contains('Create Export Pre-Assessment').click({force:true})
        .wait('@getExport');
        
        cy.get('[id=EncodingForm-id]').click({force:true}).then($container =>
            {
                cy.get('.container.grid-list-md').should('be.visible')
                cy.get('#Transactiontype-id').click().then($le =>
                    {
                        cy.get('.v-list-item__content').contains(data.export_pre_assessment_form.transaction_type).click({force: true})
                    });
                cy.get('#brokerName-id').type(data.export_pre_assessment_form.broker_name).wait(100);
                cy.get('#brokerTin-id').type(data.export_pre_assessment_form.broker_tin).wait(100);
                cy.get('#commodity-id').type(data.export_pre_assessment_form.commodity).wait(100);
                cy.get('.container.grid-list-md').find('#EDNo-id').type(data.export_pre_assessment_form.edNo).wait(100);
                cy.get('#VesselNo-id').type(data.export_pre_assessment_form.vesselNo).wait(100);
                cy.get('#arrastre-id').clear().type(data.export_pre_assessment_form.arrastreNo).wait(100);
                cy.get('#vesselArrivalDate-id')
                .click({showOn: "button",buttonText: "day"})
                .then($datePicker =>
                    { 
                        const targetDate = dayjs()
                        .add(0, 'year')
                        .add(0, 'month')
                        .add(5, 'day')
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
            })
        
        cy.pause();
        cy.contains('Save').click({force:true});
        cy.get('.v-dialog__content--active > .v-dialog > .v-card > .v-card__text').should('contain','Successfully Created Export Pre-Assessment');
        cy.get('#OK-id').click()
        .wait('@getWalletTransaction')
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
                        cy.get('#ContainerNo-id').type(data.export_container.container_no).wait(100);
                        cy.get('#Size-id').click({force: true}).then(() =>
                        {
                            cy.get('.v-list-item__content').contains(data.export_container.size).click({force: true})
                        });
                        cy.get('#Bulk-id').type(data.export_container.bulk).wait(100);
                        cy.get('#Storage-id').type(data.export_container.storage).wait(100);
                        cy.get('#Penalty-id').type(data.export_container.penalty).wait(100);
                        cy.get('#DG-id').type(data.export_container.dg).wait(100);
                        cy.get('#OC-id').type(data.export_container.oc).wait(100);
                    })
                }   
            });
            cy.pause();
            cy.contains('Save').click({force:true})
            cy.get('.v-dialog__content--active > .v-dialog > .v-card > .v-card__text')
            .should('contain','Successfully Created Export Pre-Assessment Container');
            cy.get('#OK-id').click({force: true})
            .wait('@getUserListUserRoles')
            .its('response.statusCode')
            .should('equal',200);
            cy.get('.v-data-table__wrapper')
            .find('table')
            .then(($table)=>
            {
                if($table.find('tr').length)
                {
                    cy.get('.td').find('.text-start').each(($item) =>
                    {
                        cy.contains($item.text()).should('be.visible');
                    })
                }
                else
                {
                    cy.pause();
                }
                
            });
    })
    it('Log out to GoFASTCpa', () =>{
        cy.get('[id=profileAvatar-id]').click({force: true})
        cy.contains(/^Logout$/).click({force:true})
    })

})
