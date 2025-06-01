const time = require('./dateFormat')

const addCreatedAtPlugin = function(schema, options) {
  // Добавляем поле createdAt в схему
  schema.add({
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    createdAtTimezone: {
      type: String,
      default: time(),
      // default: new Date().toLocaleString('en-US', { timeZone: "Europe/Moscow" }),
      required: true,
    }
  });

  // Добавляем обработчик события "pre-save"
  schema.pre('save', function(next) {
    // Если поле createdAt отсутствует, устанавливаем его в текущее время
    if (!this.createdAt) {
      this.createdAt = Date.now();
    }

    if (!this.createdAtTimezone) {
      this.createdAtTimezone = time()
      // this.createdAtTimezone = new Date().toLocaleString('en-US', { timeZone: "Europe/Moscow" })
    }

    // Продолжаем выполнение следующего middleware в цепочке
    next();
  });
};

module.exports = addCreatedAtPlugin;
