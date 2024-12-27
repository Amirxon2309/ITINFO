const { Schema, model } = require("mongoose");

const topicSchema = new Schema(
  {
    author_id: {
      type: Schema.Types.ObjectId,
      required: true,
      validate: {
        validator: async function (value) {
          const Author = require("./Author");
          const author = await Author.findById(value);
          return !!author;
        },
        message: "Berilgan author_id haqiqiy emas",
      },
    },
    topic_title: {
      type: String,
      uppercase: true,
      required: true,
      minlength: [5, "Topic title kamida 5 ta belgidan iborat bo'lishi kerak"],
      maxlength: [100, "Topic title 100 ta belgidan oshmasligi kerak"],
      trim: true,
    },
    topic_text: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return value.trim().length > 0; // Faqat bo'sh joylar yuborilmasligi
        },
        message: "Topic text bo'sh bo'lishi mumkin emas",
      },
    },
    is_checked: {
      type: Boolean,
      default: false,
    },
    is_approved: {
      type: Boolean,
      default: false,
    expert_id: {
      type: Schema.Types.ObjectId,
      ref: "Author",
    },
  },
},
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = model("Topic", topicSchema);
