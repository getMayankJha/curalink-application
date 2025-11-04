-- Insert sample clinical trials
INSERT INTO clinical_trials (title, description, summary, phase, status, conditions, location, contact_email, nct_id, eligibility) VALUES
(
  'Immunotherapy for Advanced Lung Cancer',
  'A Phase 3 clinical trial evaluating the efficacy and safety of novel immunotherapy combinations in patients with advanced non-small cell lung cancer who have progressed after first-line chemotherapy.',
  'This trial tests new immunotherapy drugs to help treat advanced lung cancer patients.',
  'Phase 3',
  'recruiting',
  '["Lung Cancer", "Non-Small Cell Lung Cancer"]',
  'Boston, MA, USA',
  'lungcancer-trial@hospital.org',
  'NCT04567890',
  'Adults aged 18-75 with confirmed advanced NSCLC, ECOG performance status 0-1, adequate organ function'
),
(
  'Glioblastoma Treatment Study',
  'Phase 2 trial investigating targeted therapy combined with radiation for newly diagnosed glioblastoma patients.',
  'Testing new targeted treatments for brain cancer patients combined with radiation therapy.',
  'Phase 2',
  'recruiting',
  '["Brain Cancer", "Glioblastoma", "Glioma"]',
  'New York, NY, USA',
  'braincancer@researchcenter.org',
  'NCT04789012',
  'Adults 18 years and older with newly diagnosed glioblastoma, Karnofsky score ≥ 60'
),
(
  'Heart Disease Prevention Trial',
  'A large-scale study examining lifestyle interventions and medication strategies for preventing cardiovascular disease in high-risk populations.',
  'Research study on preventing heart disease through lifestyle changes and medications.',
  'Phase 3',
  'recruiting',
  '["Heart Disease", "Cardiovascular Disease"]',
  'Chicago, IL, USA',
  'heart-study@medical.org',
  'NCT04912345',
  'Adults 40-80 years with 2+ cardiovascular risk factors, no history of heart attack or stroke'
);

-- Insert sample publications
INSERT INTO publications (title, authors, abstract, summary, journal, publication_date, keywords, doi, url) VALUES
(
  'Breakthrough in Immunotherapy for Lung Cancer',
  '["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Emily Rodriguez"]',
  'This study presents novel findings on combination immunotherapy approaches in advanced non-small cell lung cancer. We analyzed outcomes from 500 patients treated with dual checkpoint inhibitor therapy and observed significant improvements in progression-free survival compared to standard care.',
  'New research shows promising results using two immunotherapy drugs together to treat advanced lung cancer, with better outcomes than current standard treatments.',
  'New England Journal of Medicine',
  '2024-03-15',
  '["Lung Cancer", "Immunotherapy", "Checkpoint Inhibitors", "Cancer Treatment"]',
  '10.1056/NEJMoa2024001',
  'https://www.nejm.org/example-article'
),
(
  'Advances in Glioblastoma Treatment',
  '["Dr. James Wilson", "Dr. Lisa Martinez"]',
  'Glioblastoma remains one of the most challenging brain tumors to treat. This comprehensive review examines recent advances in targeted therapies, immunotherapies, and novel drug delivery systems that show promise in improving patient outcomes.',
  'A review of new treatment approaches for aggressive brain cancer, including targeted drugs and better ways to deliver medications to the brain.',
  'Nature Medicine',
  '2024-02-20',
  '["Brain Cancer", "Glioblastoma", "Targeted Therapy", "Drug Delivery"]',
  '10.1038/s41591-024-12345',
  'https://www.nature.com/articles/example'
),
(
  'Cardiovascular Risk Reduction Strategies',
  '["Dr. Robert Thompson", "Dr. Maria Garcia", "Dr. David Lee"]',
  'We present findings from a 10-year longitudinal study examining multiple interventions for cardiovascular disease prevention. Results demonstrate that combined lifestyle modifications and targeted pharmacotherapy significantly reduce major adverse cardiac events in high-risk populations.',
  'Long-term study shows that combining healthy lifestyle changes with appropriate medications effectively prevents heart attacks and strokes in at-risk individuals.',
  'Journal of the American Medical Association',
  '2024-01-10',
  '["Heart Disease", "Prevention", "Cardiovascular Health", "Risk Factors"]',
  '10.1001/jama.2024.001',
  'https://jamanetwork.com/example'
);

-- Insert sample forums
INSERT INTO forums (name, description, category) VALUES
('Cancer Research Discussions', 'A community for discussing the latest in cancer research and treatment options', 'Oncology'),
('Cardiovascular Health Forum', 'Share insights and ask questions about heart health and cardiovascular research', 'Cardiology'),
('Neurology & Brain Health', 'Discussions about neurological conditions and brain health research', 'Neurology'),
('Clinical Trials Support', 'Ask questions and share experiences about participating in clinical trials', 'General');
