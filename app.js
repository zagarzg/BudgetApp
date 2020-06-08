/***** MODEL *****/

var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expense.prototype.calcPercentage = function (totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }

    Expense.prototype.getPercentage = function () {
      return this.percentage;
    };
  };

  var calcTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else if (type === "exp") {
        newItem = new Expense(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calcBudget: function () {
      calcTotal("inc");
      calcTotal("exp");
      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
    testing: function () {
      console.log(data.allItems);
    },
  };
})();

/***** VIEW *****/

var uiController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    type === "exp" ? (sign = "-") : (sign = "+");

    return sign + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
        for (i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

  return {
    getinput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addItemList: function (obj, type) {
      var html, newHtml, element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;
        html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div>
                <div class="item__percentage">21%</div><div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      }

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPrencetages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expPercLabel);

      

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    deleteItemList: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    displayDate: function () {
      var now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' + 
        DOMstrings.inputValue
      );
      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');

      });
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

/***** CONTROLLER *****/

var appController = (function (uiCtrl, budgetCtrl) {
  var setupEventListeners = function () {
    var DOM = uiCtrl.getDOMstrings();

    document.querySelector(".add__btn").addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener("change", uiCtrl.changedType);
  };

  var updateBudget = function () {
    budgetCtrl.calcBudget();
    var budget = budgetCtrl.getBudget();
    uiCtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    budgetCtrl.calculatePercentage();
    var percentages = budgetCtrl.getPercentages();
    uiCtrl.displayPrencetages(percentages);
  };

  var ctrlAddItem = function () {
    //get the input field data
    var input, newItem;

    input = uiCtrl.getinput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value); // add the item to budget controller

      // add the idem to UI
      uiCtrl.addItemList(newItem, input.type);
      // clear fields
      uiCtrl.clearFields();

      //calculate the budget
      updateBudget();
      updatePercentages();
      //display the budget on UI
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      (type = splitID[0]), (ID = parseInt(splitID[1]));
      budgetCtrl.deleteItem(type, ID);
      uiCtrl.deleteItemList(itemID);
      updateBudget();
    }
  };

  return {
    init: function () {
      uiCtrl.displayDate();
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(uiController, budgetController);

appController.init();
