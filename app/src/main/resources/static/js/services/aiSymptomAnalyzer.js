// AI Symptom Analyzer Service
// This service maps symptoms to medical specialties using pattern matching

export class SymptomAnalyzer {
  constructor() {
    // Comprehensive symptom to specialty mapping
    this.symptomMap = {
      // Cardiology
      'cardiologist': [
        'chest pain', 'heart pain', 'palpitations', 'irregular heartbeat', 'shortness of breath',
        'chest tightness', 'heart racing', 'chest pressure', 'cardiac', 'heart attack',
        'hypertension', 'high blood pressure', 'heart murmur', 'arrhythmia', 'angina'
      ],

      // Dermatology
      'dermatologist': [
        'skin rash', 'acne', 'eczema', 'psoriasis', 'skin irritation', 'mole', 'wart',
        'skin infection', 'dermatitis', 'hives', 'skin lesion', 'itchy skin', 'dry skin',
        'skin cancer', 'melanoma', 'allergic reaction on skin', 'fungal infection'
      ],

      // Neurology
      'neurologist': [
        'headache', 'migraine', 'seizure', 'stroke', 'memory loss', 'dizziness', 'vertigo',
        'numbness', 'tingling', 'tremor', 'paralysis', 'epilepsy', 'brain fog',
        'confusion', 'loss of consciousness', 'nerve pain', 'multiple sclerosis'
      ],

      // Pediatrics
      'pediatrician': [
        'child fever', 'baby rash', 'infant cough', 'childhood illness', 'vaccination',
        'growth problems', 'developmental delay', 'child behavior', 'ear infection in child',
        'pediatric', 'newborn', 'toddler symptoms', 'teenage health'
      ],

      // Orthopedics
      'orthopedic': [
        'back pain', 'joint pain', 'knee pain', 'shoulder pain', 'fracture', 'sprain',
        'arthritis', 'bone pain', 'muscle pain', 'sports injury', 'hip pain',
        'ankle pain', 'neck pain', 'spine problems', 'ligament tear', 'tendonitis'
      ],

      // Gynecology
      'gynecologist': [
        'menstrual problems', 'pregnancy', 'pelvic pain', 'vaginal discharge', 'infertility',
        'menopause', 'ovarian cyst', 'endometriosis', 'breast pain', 'contraception',
        'prenatal care', 'irregular periods', 'heavy bleeding'
      ],

      // Psychiatry
      'psychiatrist': [
        'depression', 'anxiety', 'panic attack', 'bipolar', 'schizophrenia', 'PTSD',
        'mental health', 'mood disorder', 'suicidal thoughts', 'insomnia', 'stress',
        'eating disorder', 'addiction', 'OCD', 'phobia', 'social anxiety'
      ],

      // Dentistry
      'dentist': [
        'tooth pain', 'dental pain', 'toothache', 'gum bleeding', 'cavity', 'oral pain',
        'wisdom tooth', 'dental infection', 'bad breath', 'gum disease', 'tooth sensitivity',
        'jaw pain', 'mouth sore', 'dental emergency'
      ],

      // Ophthalmology
      'ophthalmologist': [
        'eye pain', 'vision problems', 'blurred vision', 'eye infection', 'cataracts',
        'glaucoma', 'dry eyes', 'eye redness', 'double vision', 'night blindness',
        'eye strain', 'floaters', 'retinal problems', 'eye injury'
      ],

      // ENT
      'ent': [
        'ear pain', 'hearing loss', 'sore throat', 'sinus infection', 'nasal congestion',
        'tinnitus', 'ear infection', 'throat infection', 'voice problems', 'snoring',
        'sleep apnea', 'nose bleeding', 'ear discharge', 'throat pain'
      ],

      // Urology
      'urologist': [
        'urinary problems', 'kidney stones', 'bladder infection', 'prostate problems',
        'blood in urine', 'frequent urination', 'painful urination', 'kidney pain',
        'erectile dysfunction', 'urinary incontinence', 'UTI'
      ],

      // Oncology
      'oncologist': [
        'cancer', 'tumor', 'lymphoma', 'leukemia', 'chemotherapy', 'radiation therapy',
        'oncology', 'malignant', 'benign tumor', 'cancer screening', 'metastasis'
      ],

      // Gastroenterology
      'gastroenterologist': [
        'stomach pain', 'abdominal pain', 'nausea', 'vomiting', 'diarrhea', 'constipation',
        'heartburn', 'acid reflux', 'ulcer', 'IBS', 'Crohns disease', 'colitis',
        'liver problems', 'gallbladder', 'digestive issues', 'food poisoning'
      ],

      // General Medicine
      'general': [
        'fever', 'cold', 'flu', 'cough', 'fatigue', 'general checkup', 'routine care',
        'physical exam', 'health screening', 'weight loss', 'diabetes', 'vaccination',
        'blood pressure check', 'general symptoms', 'wellness check'
      ]
    };
  }

  analyzeSymptoms(symptomsText) {
    const symptoms = symptomsText.toLowerCase();
    const recommendations = new Map();

    // Score each specialty based on symptom matches
    for (const [specialty, keywords] of Object.entries(this.symptomMap)) {
      let score = 0;
      const matchedSymptoms = [];

      keywords.forEach(keyword => {
        if (symptoms.includes(keyword)) {
          score += this.getKeywordWeight(keyword);
          matchedSymptoms.push(keyword);
        }
      });

      if (score > 0) {
        recommendations.set(specialty, {
          score,
          matchedSymptoms,
          confidence: this.calculateConfidence(score, matchedSymptoms.length)
        });
      }
    }

    // Sort by score and return top recommendations
    return Array.from(recommendations.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 3)
      .map(([specialty, data]) => ({
        specialty: this.formatSpecialtyName(specialty),
        confidence: data.confidence,
        matchedSymptoms: data.matchedSymptoms,
        reason: this.generateReason(specialty, data.matchedSymptoms)
      }));
  }

  getKeywordWeight(keyword) {
    // More specific symptoms get higher weights
    const highWeight = ['heart attack', 'stroke', 'cancer', 'tumor', 'seizure'];
    const mediumWeight = ['chest pain', 'severe headache', 'blood in urine'];

    if (highWeight.includes(keyword)) return 10;
    if (mediumWeight.includes(keyword)) return 7;
    return 5;
  }

  calculateConfidence(score, matchCount) {
    const baseConfidence = Math.min(score * 2, 85);
    const matchBonus = matchCount * 5;
    return Math.min(baseConfidence + matchBonus, 95);
  }

  formatSpecialtyName(specialty) {
    const specialtyMap = {
      'cardiologist': 'Cardiologist',
      'dermatologist': 'Dermatologist',
      'neurologist': 'Neurologist',
      'pediatrician': 'Pediatrician',
      'orthopedic': 'Orthopedic',
      'gynecologist': 'Gynecologist',
      'psychiatrist': 'Psychiatrist',
      'dentist': 'Dentist',
      'ophthalmologist': 'Ophthalmologist',
      'ent': 'ENT Specialist',
      'urologist': 'Urologist',
      'oncologist': 'Oncologist',
      'gastroenterologist': 'Gastroenterologist',
      'general': 'General Physician'
    };
    return specialtyMap[specialty] || specialty;
  }

  generateReason(specialty, matchedSymptoms) {
    const reasons = {
      'cardiologist': 'Based on your heart and cardiovascular symptoms',
      'dermatologist': 'Based on your skin-related concerns',
      'neurologist': 'Based on your neurological symptoms',
      'pediatrician': 'Based on pediatric health concerns',
      'orthopedic': 'Based on your bone, joint, or muscle symptoms',
      'gynecologist': 'Based on your reproductive health symptoms',
      'psychiatrist': 'Based on your mental health concerns',
      'dentist': 'Based on your dental and oral health symptoms',
      'ophthalmologist': 'Based on your eye-related symptoms',
      'ent': 'Based on your ear, nose, and throat symptoms',
      'urologist': 'Based on your urinary or kidney-related symptoms',
      'oncologist': 'Based on your cancer-related concerns',
      'gastroenterologist': 'Based on your digestive system symptoms',
      'general': 'Based on your general health symptoms'
    };

    return reasons[specialty] + ` (matched: ${matchedSymptoms.slice(0, 3).join(', ')})`;
  }
}

export const symptomAnalyzer = new SymptomAnalyzer();
