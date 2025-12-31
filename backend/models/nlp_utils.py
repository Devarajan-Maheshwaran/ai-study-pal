import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from collections import Counter

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

def extract_keywords(text, num_keywords=5):
    try:
        stop_words = set(stopwords.words('english'))
        words = word_tokenize(text.lower())
        filtered_words = [w for w in words if w.isalnum() and w not in stop_words]
        word_freq = Counter(filtered_words)
        keywords = [word for word, freq in word_freq.most_common(num_keywords)]
        return keywords
    except:
        return ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]

def generate_study_tips(keywords, subject):
    tips = []
    for keyword in keywords:
        tips.append(f"Focus on understanding '{keyword}' in {subject}.")
        tips.append(f"Practice problems related to '{keyword}'.")
    return tips[:5]  # Limit to 5 tips
