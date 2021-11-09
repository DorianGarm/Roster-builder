// BUDGET CONTROLLER
var budgetController = (function () {
  // *******************  Local Storage by Akshay Chandran **********************
  var localRoster;
  // *******************  Local Storage by Akshay Chandran **********************

  var Expense = function (id, description, value, designation) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.designation = designation;
  };

  var Income = function (id, description, value, designation) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.designation = designation;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  // **********************  Local Storage by Akshay Chandran *************************
  function checkForLocal() {
    if (localStorage.getItem("localRoster") === null) {
      localRoster = data;
    } else {
      localRoster = JSON.parse(localStorage.getItem("localRoster"));
    }
  }
  // **********************  Local Storage by Akshay Chandran *************************

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
  };

  return {
    addItem: function (type, des, val, desi) {
      var newItem, ID;
      // create new ID by selecting the last one (length-1) and adding +1
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create a new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val, desi);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val, desi);
      }

      // push it into our data structre
      data.allItems[type].push(newItem);

      // return the new element
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

    calculateBudget: function () {
      // 1. Calculate total income & expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // 2. Calculate the budget (inc - exp).
      data.budget = data.totals.inc + data.totals.exp;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
      };
    },

    // **********************  Local Storage by Akshay Chandran *************************
    saveToLocal: function () {
      // save the current data object
      localRoster = data;
      localStorage.setItem("localRoster", JSON.stringify(localRoster));
    },

    getFromLocal: function () {
      checkForLocal();
      return localRoster.allItems;
    },
    // **********************  Local Storage by Akshay Chandran *************************
  };
})();

// UI CONTROLLER
var UIControler = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    container: ".container",
    dateLabel: ".budget__title--month",
    designation: ".add__designation",
  };

  var formatNumber = function (num, type) {
    num = Math.abs(num);
    return num;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be either 'inc' or 'exp'
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
        designation: document.querySelector(DOMstrings.designation).value,
      }; // parseFloat converts the string into a deciimal value
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">[%designation%] %description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">[%designation%] %description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      newHtml = newHtml.replace("%designation%", obj.designation);

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
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
      var type;
      obj.budget >= 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(DOMstrings.expensesLabel).textContent =
        formatNumber(obj.totalExp, "exp");
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

// GLOBAL APP CONTROLER
var controler = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    // 1. Calculate the budget.
    budgetCtrl.calculateBudget();

    // 2. Return the budget.
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI.
    UICtrl.displayBudget(budget);

    // **********************  Local Storage by Akshay Chandran *************************
    budgetCtrl.saveToLocal();
    // **********************  Local Storage by Akshay Chandran *************************
  };

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get the field input data.
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller.
      newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value,
        input.designation
      );

      // 3. Add the new item to the UI.
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields.
      UICtrl.clearFields();

      // 5. Calculte an update the budget.
      updateBudget();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure.
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI.
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget.
      updateBudget();

      // 4. Calculate and update the percentages.
      updatePercentages();
    }
  };

  // **********************  Local Storage by Akshay Chandran *************************
  var ctrlRetrieveItem = function () {
    var allItems, incItems, expItems, newItem;

    allItems = budgetCtrl.getFromLocal();
    incItems = allItems.inc;
    expItems = allItems.exp;

    // Retrieve 'inc' items, add to UI call addListItem(obj, type)
    incItems.forEach(function (item) {
      newItem = budgetCtrl.addItem(
        "inc",
        item.description,
        item.value,
        item.designation
      );
      UICtrl.addListItem(newItem, "inc");
    });
    // Retrieve 'exp' items, add to UI
    expItems.forEach(function (item) {
      newItem = budgetCtrl.addItem(
        "exp",
        item.description,
        item.value,
        item.designation
      );
      UICtrl.addListItem(newItem, "exp");
    });
  };
  // **********************  Local Storage by Akshay Chandran *************************

  return {
    init: function () {
      //
      // UICtrl.displayMonth();
      setupEventListeners();

      // **********************  Local Storage by Akshay Chandran *************************
      // UICtrl.displayBudget({
      //    budget: 0,
      //    totalInc: 0,
      //    totalExp: 0,
      //     percentage: -1
      // });
      ctrlRetrieveItem();
      // **********************  Local Storage by Akshay Chandran *************************

      updateBudget();
    },
  };
})(budgetController, UIControler);

controler.init();
