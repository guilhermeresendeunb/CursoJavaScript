//BUDGET CONTROLLER
var budgetController = (function () {
    //Construtor de objetos de despesas
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;        
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){        
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100 );    
        }
        else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    //Construtor de objetos de receita
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };    
    //Objetos para armazenar os totais
    var data = {
            allItems: {
                exp: [],
                inc: []
            },
            totals: {
                exp: 0,
                inc: 0
            },
            budget: 0,
            percentage: -1
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    return{
            addItem: function(type,des,val){
                
                var newItem, ID;
                // descobre o ultimo id do objeto no array respectivo
                if(data.allItems[type].length > 0){
                    ID = data.allItems[type][data.allItems[type].length -1 ].id + 1;
                }else{
                    ID= 0;   
                }             
                // cria o objeto
                if(type==='exp'){
                    newItem = new Expense(ID, des, val);
                }
                else if(type==='inc'){
                    newItem = new Income(ID, des, val);    
                }
                // insere o objeto no array
                data.allItems[type].push(newItem);
                
                return newItem;
            },
            deleteItem: function(type,id){
                var index,ids;
                                       
                ids = data.allItems[type].map(function(current){
                    return current.id;                    
                });
                
                index = ids.indexOf(id);
                
                if(index !== -1 ){
                   data.allItems[type].splice(index, 1);
                }
            },
            calculateBudget:function(){
                
                // calculate total income and expenses
                calculateTotal('exp');
                calculateTotal('inc');
                
                // calculate the budget: income-exp
                data.budget = data.totals.inc - data.totals.exp;
                
                // calculate the percentage of income already spent
                if(data.totals.inc > 0){
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else{
                    data.percentage = -1;
                }
              
            },
            calculatePercentages: function(){
                
                data.allItems.exp.forEach(function(cur){
                    cur.calcPercentage(data.totals.inc);
                });               
            },
            getPercentages: function(){
                var allPerc = data.allItems.exp.map(function(cur){
                    return cur.getPercentage();
                });
                return allPerc;
            },
            getBudget: function(){
                return{
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
            },
           /* getPercentage: function(){              
                return{
                    expensePercentage: data.allItems.exp;    
                }                
            },*/
            testing: function(){
                console.log(data);
            }
    };
    
})();

//UI CONTROLLER
var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
    };
    
    return {
        getDOMstrings: function(){
            return DOMstrings;  
        },            
        
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value )
            };               
        },
        addListItem: function(obj, type){
            // create html string with placeholder text
            var html, newHtml, element;//, totalIncome, totalBudget;
            
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;    
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';                
            } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage% %</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';                
            }
            
            // replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);    
            //totalBudget = budgetController.getBudget();
            //totalIncome = totalBudget.totalInc;
            //newHtml = newHtml.replace('%percentage%', Math.round((obj.value/totalIncome) *100));
            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);    
        
        },
        deleteListItem: function(selectorID){               
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        clearFields: function(){
            var fields, fieldsArray
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;        
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else{
                document.querySelector(DOMstrings.percentageLabel).textContent ='---'
            }
            
        },
        displayPercentages: function(percentages){
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // returns a node list
            
            var NodeListForEach = function(list,callback){
                for(var i=0; i<list.length; i++){
                    callback(list[i],i);
                }
            }
            
            NodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';    
                }else{
                    current.textContent = '---';
                } 
            });
            
        }
    };    
})();





// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setUpEventListeners = function(){
        
        var DOM = UICtrl.getDOMstrings(); 
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
          if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
             }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }
    
    var updateBudget = function(){
        // calculate the budget
        budgetCtrl.calculateBudget();
        
        // return the budget
        var budget = budgetCtrl.getBudget();
        
        // display the budget on the UI
        UICtrl.displayBudget(budget);
        
    }
    
    var updatePercentage = function(){
        // calculate the percentage
        budgetCtrl.calculatePercentages();
        // return the percentage
        var percentages = budgetCtrl.getPercentages();
        
        // display the percentage on the UI
        UICtrl.displayPercentages(percentages);
    }
    
    var ctrlAddItem = function(){
        var input, newItem;
        // get the field input data
        input = UICtrl.getInput();     
        
        if(input.description!=="" && !input.value.isNaN && input.value > 0){ //validação do input
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            //console.log(newItem);
            // add the new item to the UI
            UICtrl.addListItem(newItem,input.type);

            // clear the fields
            UICtrl.clearFields();

            // Calculate and update budget
            updateBudget();
            
            // Calculate and update percentage
            updatePercentage();
        }
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
       
        if(itemID){
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);
            
            // delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // Update and show the new budget
            updateBudget();
            
            // Calculate and update percentage
            updatePercentage();
        } 
    };
    
    return {
        init: function(){
            console.log('app started');
            setUpEventListeners();
            UICtrl.displayBudget({budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1});
        }  
    };
    
})(budgetController, UIController);

controller.init();




